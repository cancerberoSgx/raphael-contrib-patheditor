//editor path extension code 

/* path editor extension 
 * a path editor for be able of edit the path commands dragging its points.
 * 
 * TODO: 
 * - visual feedback of the path segment / command being edited. 
 * 
 * 
//now the example

var paper = Raphael(0,0,600,600); 
var path = paper.path("M431,52L252,27L302,94M35,160V77L188,94L129,44H230L361,185C369,241,202,213,181,269S129,232,73,296Z"); 
var pathEd = path.installPathEditor(); 
pathEd.setChangeEvent(function(ctx){
})

 * 
 * @author: sgurin 
 */
(function(){
	
	var ns = {}; 
	
	raphaelpatheditor=ns;

    //default editor config - configurable property, see @installPathEditor
    var commandEditors = {
        "L": {"bgColor": "#ededed", "textColor": "black", "name": "L", description: "line to"},
        "M": {"bgColor": "#111111", "textColor": "white", "name": "M", description: "move to"},
        "H": {"bgColor": "#ff1111", "textColor": "yellow", "name": "H", description: "horizontal line to"},
        "V": {"bgColor": "#ffff11", "textColor": "yellow", "name": "V", description: "vertical line to"}, 
        "C": {"bgColor": "#55ee55", "textColor": "black", "name": "C", description: "curve to"},
        "S": {"bgColor": "#1111ff", "textColor": "black", "name": "S", description: "smooth curve to"},
        "Q": {"bgColor": "orange", "textColor": "black", "name": "Q", description: "quadratic Bézier curve to"}
    }; 
    
	var extendObject=function(children, parent) {
		for(var i in parent) { //don't use hasOwnProperty()
			children[i] = parent[i]; 
		}
	}

	/**
	 * @class EditorContext - returned to the user when an editor is installed in a shape, 
	 * It serves as the main entry point for talking to that shape's installed editor. 
	 * @property pathObject
	 * @property shape 
	 * @property commandEditors a configuration for each command type like bgCOlor, textColor, description, name. See variable commandEditors
	 * @property editorSet a raphael set of all the path commands editor-shapes (the points)
	 * @property legendSet the legend shapes. 
	 * @property dragThrottle number (in ms)
	 */
	var EditorContext = function(context){
		extendObject(this, context); 
	}; 
	EditorContext.prototype =  {
		/**
		 * the user is responsible of triggering this handler when (user defined) action is performed
		 * @method createNewCommand
		 * @param createCommand an object with the following information: {index: 5, cmd: ["M", 1, 2] }
		 */
		createNewCommand: function(cmd) {
			if(!cmd || !cmd.cmd || index<0 || index>this.pathObject.length)
				return;
			var newCmdShape = buildPathCmdEditorFor(this, cmd.cmd);
			//now update the "model": first start with the shapeCommand, then rebuild the path shape
			this.pathObject.splice(cmd.index, 0, cmd.cmd);
        }
		/**
		 * register a function that will be notified when this editor model's change
		 */
    ,	setChangeListener: function(fn) {    		
    	}
    }; 
	

	/**
	 * removes all this set's shapes from the paper. 
	 */
	Raphael.st.remove = function() {
		this.forEach(function(shape, index){
			shape.remove();
		}); 
	}
    
    /**
     * installs a new path editor on this path. 
     * 
     * @param cfg is an object with following parameters :
     * commandEditors - colors and names for each path cmd
     * dragThrottle - the dragThrottle in ms - default 80.
     * 
     * @return
     * an EditorContext object
     * 
     */
    Raphael.el.installPathEditor = function(cfg) {
        cfg = !cfg ? {} : cfg; 
        if(!this.type || this.type!="path" || !this.attr("path")) 
            return; 
        var pathObject = Raphael.parsePathString(this.attr("path"));         
       
        var editorSet = this.paper.set(), 
            legendSet=this.paper.set(); 

        var context = {
    		"editorSet": editorSet,
    		"legendSet": legendSet,
            "pathObject": pathObject, 
            "shape": this, 
            "commandEditors" : cfg.commandEditors ? cfg.commandEditors : commandEditors, 
            "dragThrottle": cfg.dragThrottle ? dragThrottle : 80,
            legendVSeparation: cfg.legendVSeparation ? legendVSeparation : 25
        }
        
        for ( var i = 0; i < pathObject.length; i++) {
            var cmd = pathObject[i]; 
            var cmdEditShape = buildPathCmdEditorFor(context, cmd); 
            editorSet.push(cmdEditShape);
        }
        context['editorSet']=editorSet;
        
        //build legend set
        var y = 10; 
        for(var i in context.commandEditors) {
            paper.circle(10, y, 5).attr({fill: context.commandEditors[i]["bgColor"]}); 
            var legendShape = paper.text(30, y, context.commandEditors[i]["description"]).attr({"text-anchor": "start"});
            legendSet.push(legendShape);
            y+=context.legendVSeparation; 
        }
        context['legendSet']=legendSet;
        
        var ctx = new EditorContext(context); 
        this.__editorCtx=ctx;        
//        debugger;
        return ctx; 
    }; 
    
    /**
     * uninstalls a path editor already installed in this shape, if any. 
     * @method uninstallPathEditor
     * @return the old EditorContext with shapes currently removed from paper. 
     */
    Raphael.el.uninstallPathEditor = function(){
    	var ctx = this.__editorCtx; 
    	if(ctx) {
    		ctx.editorSet.remove();
    		this.__editorCtx=null; 
    	}
    	return ctx;
    }
    Raphael.el.hidePathEditor = function(){
    	
    }
    
    var buildPathCmdEditorFor = function(context, cmd) {
    	
        if(!cmd ||cmd.length<1)
            return; 
        
        if(cmd[0]=="L"&&cmd.length==3) {    
            return buildLineToCmdEditor(context, cmd);
        }
        else if(cmd[0]=="M"&&cmd.length==3) {    
            return buildMoveToCmdEditor(context, cmd);
        }
        else if(cmd[0]=="H"&&cmd.length==2) {    
            return buildHLineToCmdEditor(context, cmd);
        }
        else if(cmd[0]=="V"&&cmd.length==2) {    
            return buildVLineToCmdEditor(context, cmd);
        }
        else if(cmd[0]=="C"&&cmd.length==7) {    
            return buildCurveToCmdEditor(context, cmd);
        }
        else if(cmd[0]=="S"&&cmd.length==5) {    
            return buildSCurveToCmdEditor(context, cmd);
        }
        else if(cmd[0]=="Q"&&cmd.length==5) {    
            return buildQCurveToCmdEditor(context, cmd);
        }
    }; 
    

    var createCmdShape = function(center, context, cmd, shapeType) {
    	var shape = context.shape.paper.circle(center[0], center[1], 5).attr({
    		fill: context.commandEditors[shapeType]["bgColor"]
    	});
    	return shape;
    }; 
   
    
    //L - lineto
    var buildLineToCmdEditor = function(context, cmd) {
        var paper = context.shape.paper; 
        var c = createCmdShape([cmd[1], cmd[2]], context, cmd, "L");//c = paper.circle(cmd[1], cmd[2], 5).attr({fill: context.commandEditors["L"]["bgColor"]}); 
        var ctx = {
        	"pathObject": context.pathObject, 
        	"shape": context.shape, 
            "feedback": c, 
            "cmd": cmd
        }; 
        c.drag(function_throttle(context.dragThrottle, 
            function(dx, dy){ /*move*/
                var x = this.ox+dx, y = this.oy+dy; 
                this.cmd[1]=x; 
                this.cmd[2]=y;
                this.feedback.attr({"cx": x, "cy": y});
                this.shape.attr({"path": this.pathObject}); 
            }),
            function(x, y){ /*drag start*/
                this.ox=this.feedback.attr("cx"); 
                this.oy=this.feedback.attr("cy");
            },  function(){ /*ends*/
                
            }, ctx, ctx, ctx
        );
        return c;
    }; 
    
    //M - moveto
    var buildMoveToCmdEditor = function(context, cmd) {
        var paper = context.shape.paper; 
        var c = createCmdShape([cmd[1], cmd[2]], context, cmd, "M");//paper.circle(cmd[1], cmd[2], 5).attr({fill: context.commandEditors["M"]["bgColor"]});            
        var ctx = {"pathObject": context.pathObject, "shape": context.shape, 
            "feedback": c, "cmd": cmd}
        c.drag(function_throttle(context.dragThrottle, 
            function(dx, dy){ /*move*/
                var x = this.ox+dx, y = this.oy+dy; 
                this.cmd[1]=x; 
                this.cmd[2]=y;
                this.feedback.attr({"cx": x, "cy": y});
                this.shape.attr({"path": this.pathObject}); 
            }),
            function(x, y){ /*drag start*/
                this.ox=this.feedback.attr("cx"); 
                this.oy=this.feedback.attr("cy");
            },  function(){ /*ends*/
                
            }, ctx, ctx, ctx
        );
        return c;
    }; 
    

    //H horizontal line
    var buildHLineToCmdEditor = function(context, cmd) {
        var paper = context.shape.paper; 
        var c = createCmdShape([cmd[1], 50], context, cmd, "H");//paper.circle(cmd[1], 50, 5).attr({fill: context.commandEditors["H"]["bgColor"]});            
        var ctx = {
        	"pathObject": context.pathObject, 
        	"shape": context.shape, 
//            "feedback": c, 
            "cmd": cmd
        }
        c.drag(function_throttle(context.dragThrottle, 
            function(dx, dy){ /*move*/
                var x = this.ox+dx, y = this.oy+dy; 
                this.cmd[1]=x; 
//                this.cmd[2]=y;
                this.shape.attr({"cx": x, "cy": y});
                this.shape.attr({"path": this.pathObject}); 
            }),
            function(x, y){ /*drag start*/
                this.ox=this.shape.attr("cx"); 
                this.oy=this.shape.attr("cy");
            },  function(){ /*ends*/
                
            }, ctx, ctx, ctx
        );
        return c;
    }; 
    
    //V - vertical line
    var buildVLineToCmdEditor = function(context, cmd) {
        var paper = context.shape.paper; 
        var c = createCmdShape([50, cmd[1]], context, cmd, "V");//paper.circle(50, cmd[1], 5).attr({fill: context.commandEditors["V"]["bgColor"]});            
        var ctx = {"pathObject": context.pathObject, "shape": context.shape, 
            "feedback": c, "cmd": cmd}
        c.drag(function_throttle(context.dragThrottle, 
            function(dx, dy){ /*move*/
                var x = this.ox+dx, y = this.oy+dy; 
//                this.cmd[1]=x; 
                this.cmd[1]=y;
                this.feedback.attr({"cx": x, "cy": y});
                this.shape.attr({"path": this.pathObject}); 
            }),
            function(x, y){ /*drag start*/
                this.ox=this.feedback.attr("cx"); 
                this.oy=this.feedback.attr("cy");
            },  function(){ /*ends*/
                
            }, ctx, ctx, ctx
        );
        return c;
    }; 
    
    //C - curveto
    var buildCurveToCmdEditor = function(context, cmd) {
        var paper = context.shape.paper; 
        var set = paper.set(); 
        var c1 = createCmdShape([cmd[1], cmd[2]], context, cmd, "C"); //paper.circle(cmd[1], cmd[2], 5).attr({fill: context.commandEditors["C"]["bgColor"]});            
        var ctx1 = {"pathObject": context.pathObject, "shape": context.shape, 
            "feedback": c1, "cmd": cmd}
        c1.drag(function_throttle(context.dragThrottle, 
            function(dx, dy){ /*move*/
                var x = this.ox+dx, y = this.oy+dy; 
                this.cmd[1]=x; 
                this.cmd[2]=y;
                this.feedback.attr({"cx": x, "cy": y});
                this.shape.attr({"path": this.pathObject}); 
            }),
            function(x, y){ /*drag start*/
                this.ox=this.feedback.attr("cx"); 
                this.oy=this.feedback.attr("cy");
            },  function(){ /*ends*/
                
            }, ctx1, ctx1, ctx1
        );
        set.push(c1);
        
        var c2 = createCmdShape([cmd[3], cmd[4]], context, cmd, "C");//paper.circle(cmd[3], cmd[4], 5).attr({fill: context.commandEditors["C"]["bgColor"]});            
        var ctx2 = {"pathObject": context.pathObject, "shape": context.shape, 
            "feedback": c2, "cmd": cmd}
        c2.drag(function_throttle(context.dragThrottle, 
            function(dx, dy){ /*move*/
                var x = this.ox+dx, y = this.oy+dy; 
                this.cmd[3]=x; 
                this.cmd[4]=y;
                this.feedback.attr({"cx": x, "cy": y});
                this.shape.attr({"path": this.pathObject}); 
            }),
            function(x, y){ /*drag start*/
                this.ox=this.feedback.attr("cx"); 
                this.oy=this.feedback.attr("cy");
            },  function(){ /*ends*/
                
            }, ctx2, ctx2, ctx2
        );
        set.push(c2);        
        var c3 = createCmdShape([cmd[5], cmd[6]], context, cmd, "C");// paper.circle(cmd[5], cmd[6], 5).attr({fill: context.commandEditors["C"]["bgColor"]});            
        var ctx3 = {"pathObject": context.pathObject, "shape": context.shape, 
            "feedback": c3, "cmd": cmd}
        c3.drag(function_throttle(context.dragThrottle, 
            function(dx, dy){ /*move*/
                var x = this.ox+dx, y = this.oy+dy; 
                this.cmd[5]=x; 
                this.cmd[6]=y;
                this.feedback.attr({"cx": x, "cy": y});
                this.shape.attr({"path": this.pathObject}); 
            }),
            function(x, y){ /*drag start*/
                this.ox=this.feedback.attr("cx"); 
                this.oy=this.feedback.attr("cy");
            },  function(){ /*ends*/
                
            }, ctx3, ctx3, ctx3
        );
        set.push(c3);
        return set;
    }; 
    
    
    //S - smooth curveto
    var buildSCurveToCmdEditor = function(context, cmd) {
        var paper = context.shape.paper; 
        var set = paper.set(); 
     
        var c1 = createCmdShape([cmd[1], cmd[2]], context, cmd, "S"); //paper.circle(cmd[1], cmd[2], 5).attr({fill: context.commandEditors["S"]["bgColor"]});            
        var ctx1 = {
        	"pathObject": context.pathObject, 
        	"shape": context.shape, 
            "feedback": c1, 
            "cmd": cmd
        }
        c1.drag(function_throttle(context.dragThrottle, 
            function(dx, dy){ /*move*/
                var x = this.ox+dx, y = this.oy+dy; 
                this.cmd[1]=x; 
                this.cmd[2]=y;
                this.feedback.attr({"cx": x, "cy": y});
                this.shape.attr({"path": this.pathObject}); 
            }),
            function(x, y){ /*drag start*/
                this.ox=this.feedback.attr("cx"); 
                this.oy=this.feedback.attr("cy");
            },  function(){ /*ends*/
                
            }, ctx1, ctx1, ctx1
        );
        set.push(c1);
        
        var c2 = createCmdShape([cmd[3], cmd[4]], context, cmd, "S");//paper.circle(cmd[3], cmd[4], 5).attr({fill: context.commandEditors["S"]["bgColor"]});            
        var ctx2 = {"pathObject": context.pathObject, "shape": context.shape, 
            "feedback": c2, "cmd": cmd}
        c2.drag(function_throttle(context.dragThrottle, 
            function(dx, dy){ /*move*/
                var x = this.ox+dx, y = this.oy+dy; 
                this.cmd[3]=x; 
                this.cmd[4]=y;
                this.feedback.attr({"cx": x, "cy": y});
                this.shape.attr({"path": this.pathObject}); 
            }),
            function(x, y){ /*drag start*/
                this.ox=this.feedback.attr("cx"); 
                this.oy=this.feedback.attr("cy");
            },  function(){ /*ends*/
                
            }, ctx2, ctx2, ctx2
        );
        set.push(c2);
        
        return set;
    }; 
    
    
    
    
    var function_throttle = function ( delay, no_trailing, callback, debounce_mode ) {
         var timeout_id,
           last_exec = 0;
        if ( typeof no_trailing !== 'boolean' ) {
          debounce_mode = callback;
          callback = no_trailing;
          no_trailing = undefined;
        };
        function wrapper() {
          var that = this,
            elapsed = +new Date() - last_exec,
            args = arguments;      
          function exec() {
            last_exec = +new Date();
            callback.apply( that, args );
          };      
          function clear() {
            timeout_id = undefined;
          };      
          if ( debounce_mode && !timeout_id ) {
            exec();
          }      
          timeout_id && clearTimeout( timeout_id );      
          if ( debounce_mode === undefined && elapsed > delay ) {
            exec();
            
          } else if ( no_trailing !== true ) {     
            timeout_id = setTimeout( debounce_mode ? clear : exec, debounce_mode === undefined ? delay - elapsed : delay );
          }
        };
        return wrapper;
    };
    
})(); 





//rapahel extension idea sidenote

///**
// * raphael shapes can be reused in multiple papers or remove()d and added again easily with this method
// * @returns a new shape, based on self, rendered on te given papaer. Notice that this shape belongs to another paper's than self's.
// */
//Raphael.el.render = function(paper) {
//	if(this.type=="rect") {
//		
//	}
//	if(this.type=="ellipse") {
//				
//	}
//	if(this.type=="rect") {
//		
//	}
//	if(this.type=="rect") {
//		
//	}
//	if(this.type=="rect") {
//		
//	}
//} 
//

/*
Checkout Error Management. 

The logic for designing a checkout with mutltiple Steps is that, in each step, when the user presses continue, some important part of the customer's 
order is updated in the backend. When the user presses continue, he or she expects thier data to be sended and validated by the server and somehow 
complete that part of the checkout proccess. 

In the context of a Step then, we can differentiate two classes of errors: 

1) STEP LEVEL ERRORS: these are errors that mainly occurred at the backend when
2) MODULE LEVEL ERRORS  
a relative big update is done 
in the customer's order. This means some portion of the or


preguntas / conclusiones de checkout
 
1) generica - errores: 


para kf: cada módulo, por lo gral solo actualiza el modelo y delega en super.submit() para que sea el Step el encargado de hacer el commit gral y mostrar errores. ejemplo invoice
por otro lado hay modulos que si necesitarán hacer ajax....

*/
