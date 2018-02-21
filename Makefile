
OUTDIR=www
TEMPLATE_OUTDIR=$(OUTDIR)/app/templates

SRC= app/app.js \
  app/app.config.js \
  app/app.route.js \
  app/directives/navbar.js \
  app/directives/jsTree.directive.js \
  app/directives/dnd-fileExplorer.js \
  app/directives/spinalInspect.js \
  app/services/spinalCore.js \
  app/services/spinalModelDictionary.js \
  app/services/spinalFilesystem.js \
  app/services/goldenLayoutService.js \
  app/services/authService.js \
  app/controllers/sideBarCtrl.js \
  app/controllers/mainCtrl.js \
  app/controllers/FileExplorerCtrl.js \
  app/controllers/navbarCtrl.js \
  app/controllers/InspectorCtrl.js \
  app/controllers/loginCtrl.js

OUT= $(OUTDIR)/js/app.compile.min.js

LIBSRC= bower_components/angular/angular.min.js \
  bower_components/angular-aria/angular-aria.min.js \
  bower_components/angular-animate/angular-animate.min.js \
  bower_components/angular-material/angular-material.min.js \
  bower_components/angular-route/angular-route.min.js \
  bower_components/jquery/dist/jquery.min.js \
  bower_components/bootstrap/dist/js/bootstrap.min.js \
  bower_components/golden-layout/dist/goldenlayout.min.js \
  bower_components/angular-material-icons/angular-material-icons.min.js \
  bower_components/jstree/dist/jstree.min.js \
  bower_components/angular-material-data-table/dist/md-data-table.min.js \
  bower_components/jquery-ui/jquery-ui.min.js \
  bower_components/d3/d3.min.js \
  bower_components/d3-context-menu/js/d3-context-menu.js

LIBOUT= $(OUTDIR)/js/lib.compile.min.js

CSS= bower_components/angular-material/angular-material.css \
  bower_components/material-design-icons/iconfont/material-icons.css \
  bower_components/golden-layout/src/css/goldenlayout-base.css \
  bower_components/golden-layout/src/css/goldenlayout-dark-theme.css \
  bower_components/jstree/dist/themes/default-dark/style.min.css \
  bower_components/font-awesome/css/font-awesome.css \
  bower_components/angular-material-data-table/dist/md-data-table.min.css \
  bower_components/bootstrap/dist/css/bootstrap.min.css \
  bower_components/d3-context-menu/css/d3-context-menu.css \
  app/css/app.css

CSSOUT= $(OUTDIR)/css/css.compile.css

all: compile 

create_outdir:
	@mkdir -p $(TEMPLATE_OUTDIR)
	@mkdir -p $(OUTDIR)/js
	@mkdir -p $(OUTDIR)/css
	@mkdir -p $(OUTDIR)/fonts

link: create_outdir
	cp index.html assets www/ -r
	cp app/templates/* $(TEMPLATE_OUTDIR) -r

# ln:
# 	cd .. && ln -s spinalhome/www spinaldrive

compile: create_outdir
	@npm run compile -- $(SRC) -o $(OUT)

lib: create_outdir
	cat $(LIBSRC) > $(LIBOUT)

css: create_outdir
	cat $(CSS) | csso -o $(CSSOUT) --map file
	cp bower_components/jstree/dist/themes/default-dark/32px.png bower_components/jstree/dist/themes/default-dark/40px.png bower_components/jstree/dist/themes/default-dark/throbber.gif $(OUTDIR)/css
	cp bower_components/font-awesome/fonts/* $(OUTDIR)/fonts -r

watch-js-min:
	babel $(SRC) -w -o $(OUT) --presets es2015 --presets minify -s

watch-js:
	babel $(SRC) -w -o $(OUT) --presets es2015 -s

doc:
	jsdoc2md $(SRC) > README.md

init: lib css link compile

run:
	@true

clean:
	rm -rf www bower_components

.PHONY: all init run compile lib link css create_outdir doc 
