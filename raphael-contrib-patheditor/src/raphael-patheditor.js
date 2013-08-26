//editor path extension code 

/* path editor extension 
 * a path editor for be able of edit the path commands dragging its points.
 * 
 * TODO: 
 * -visual feedback of the path segment / command being edited. 
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

	var EditorContext = function(editorSet, legendSet){
		this.editor=editorSet;
		this.legend=legendSet; 
	}; 
	EditorContext.prototype =  {
        doCreateNewCommand: function() {
        }
    ,	setChangeListener: function(fn) {    		
    	}
    }; 
    
    /**
     * installs a new path editor on this path. 
     * 
     * cfg is an object with following parameters :
     * commandEditors - colors and names for each path cmd
     * dragThrottle - the dragThrottle in ms - default 80.
     * 
     */
    Raphael.el.installPathEditor = function(cfg) {
        cfg = !cfg ? {} : cfg; 
        if(!this.type || this.type!="path" || !this.attr("path")) 
            return; 
        var pathObject = Raphael.parsePathString(this.attr("path")); 
        
        var context = {
            "pathObject": pathObject, 
            "shape": this, 
            "commandEditors" : cfg.commandEditors ? cfg.commandEditors : commandEditors, 
            "dragThrottle": cfg.dragThrottle ? dragThrottle : 80
        }
        var editorSet = this.paper.set(), 
            legendSet=this.paper.set(); 
        for ( var i = 0; i < pathObject.length; i++) {
            var cmd = pathObject[i]; 
            var cmdEditShape = buildPathCmdEditorFor(context, cmd); 
        }
        
        //build legend set
        var y = 10; 
        for(var i in context.commandEditors) {
            paper.circle(10, y, 5).attr({fill: context.commandEditors[i]["bgColor"]}); 
            paper.text(30, y, context.commandEditors[i]["description"]).attr({"text-anchor": "start"}); 
            y+=25; 
        }
        var ctx = new EditorContext(editorSet, legendSet); 
        this.__editorCtx=ctx;        
        return ctx; 
    }; 
    //default editor config
    var commandEditors = {
        "L": {"bgColor": "#ededed", "textColor": "black", "name": "L", description: "line to"},
        "M": {"bgColor": "#111111", "textColor": "white", "name": "M", description: "move to"},
        "H": {"bgColor": "#ff1111", "textColor": "yellow", "name": "H", description: "horizontal line to"},
        "V": {"bgColor": "#ffff11", "textColor": "yellow", "name": "V", description: "vertical line to"}, 
        "C": {"bgColor": "#55ee55", "textColor": "black", "name": "C", description: "curve to"},
        "S": {"bgColor": "#1111ff", "textColor": "black", "name": "S", description: "smooth curve to"},
        "Q": {"bgColor": "orange", "textColor": "black", "name": "Q", description: "quadratic Bézier curve to"}
    }; 
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
    
    //L - lineto
    var buildLineToCmdEditor = function(context, cmd) {
        var paper = context.shape.paper; 
        var c = paper.circle(cmd[1], cmd[2], 5).attr({fill: context.commandEditors["L"]["bgColor"]}); 
        var ctx = {"pathObject": context.pathObject, "shape": context.shape, 
            "feedback": c, "cmd": cmd}; 
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
        var c = paper.circle(cmd[1], cmd[2], 5).attr({fill: context.commandEditors["M"]["bgColor"]});            
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
        var c = paper.circle(cmd[1], 50, 5).attr({fill: context.commandEditors["H"]["bgColor"]});            
        var ctx = {"pathObject": context.pathObject, "shape": context.shape, 
            "feedback": c, "cmd": cmd}
        c.drag(function_throttle(context.dragThrottle, 
            function(dx, dy){ /*move*/
                var x = this.ox+dx, y = this.oy+dy; 
                this.cmd[1]=x; 
//                this.cmd[2]=y;
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
    
    //V - vertical line
    var buildVLineToCmdEditor = function(context, cmd) {
        var paper = context.shape.paper; 
        var c = paper.circle(50, cmd[1], 5).attr({fill: context.commandEditors["V"]["bgColor"]});            
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
        var c1 = paper.circle(cmd[1], cmd[2], 5).attr({fill: context.commandEditors["C"]["bgColor"]});            
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
        
        var c2 = paper.circle(cmd[3], cmd[4], 5).attr({fill: context.commandEditors["C"]["bgColor"]});            
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
        var c3 = paper.circle(cmd[5], cmd[6], 5).attr({fill: context.commandEditors["C"]["bgColor"]});            
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
        var c1 = paper.circle(cmd[1], cmd[2], 5).attr({fill: context.commandEditors["S"]["bgColor"]});            
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
        
        var c2 = paper.circle(cmd[3], cmd[4], 5).attr({fill: context.commandEditors["S"]["bgColor"]});            
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

