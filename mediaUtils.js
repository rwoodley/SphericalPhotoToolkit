/**
puts a set of flat divs over your page for managing media.
and sets up the globe.
**/ 
function mediaUtils(scene, camera, 
       mediaListContainerId, cameraControlsContainerId,
        fileObject) {
	var that = this;
	this.mediaListContainerId = mediaListContainerId;
    this.cameraControlsContainerId = cameraControlsContainerId;
    this.fileObject = fileObject;

	this.camera = camera;
	this.scene = scene;

    this.rotateYAmount = 0;
    this.rotateXAmount = 0;
    this.FOV = 90;

    this.controlPanelVisible = true;
	document.body.onkeyup = function(e){
        if(e.keyCode == 32) {
            that.toggleControlPanel();
        }
    };

    this.showToast = function(message, ms) {
        var options = {
            settings: {
                duration: ms
            }
        };        
        this.toast = new iqwerty.toast.Toast(message, options);
    }

    this.initMediaUtils = function() {
	    that.initSkyBox();
	    that.toggleControlPanel();
	    that.setupCameraControlIcons();
        // that.updateSkyDomeForFileName(myTextures[0]);
        that.updateSkyDomeForFileObject(that.fileObject);
        that.setInitialCameraPosition();
	}
    this.setInitialCameraPosition = function() {
        that.camera.position.x = -1; that.camera.position.y = 0.0; that.camera.position.z = 0;   
    }
    this.setupCameraControlIcons = function() {
    	var container = document.getElementById(that.cameraControlsContainerId);
    	appendSingleIcon(container, 'cameraControlIcon', 'left', 'Camera Left', that.cameraLeft);
    	appendSingleIcon(container, 'cameraControlIcon', 'up', 'Camera Up', that.cameraUp);
    	appendSingleIcon(container, 'cameraControlIcon', 'down', 'Camera Down', that.cameraDown);
    	appendSingleIcon(container, 'cameraControlIcon', 'right', 'Camera Right', that.cameraRight);
    	appendSingleIcon(container, 'cameraControlIcon', 'stop', 'Camera Stop', that.cameraStop);
        appendSingleIcon(container, 'cameraControlIcon', 'flipCamera', 'Flip Camera', that.flipCamera);
        appendSingleIcon(container, 'cameraControlIcon', 'fovNarrow', 'Smaller Viewport', that.narrowFOV);
        appendSingleIcon(container, 'cameraControlIcon', 'fovWide', 'Wider Viewport', that.widerFOV);
    }
    function appendSingleIcon(containerEl, style, png, title, callback) {
    	var el;
    	el = document.createElement('span');
    	el.innerHTML = "<img src='icons/xxx.png' title=\"yyy\" class='showhide zzz'></img>"
    		.replace('xxx', png).replace('yyy', title).replace('zzz', style);
    	$(el).click(callback);
    	containerEl.appendChild(el);
    }
	this.toggleControlPanel = function() {
    	that.controlPanelVisible = !that.controlPanelVisible;
    	if (that.controlPanelVisible) {
            $('.showhide').hide();
		}
		else {
            $('.showhide').show();
		}
	}
	this.animate = function(cameraVectorLength) {
        if (that.plane.visible) {
            that.setInitialCameraPosition();
            that.camera.position.x *=-1;
        }
        else {
    		var unitVector = (new THREE.Vector3())
                .copy(that.camera.position)
                .normalize()
                .multiplyScalar(cameraVectorLength);
            that.camera.position.set(unitVector.x, unitVector.y, unitVector.z);
            that.camera.lookAt(new THREE.Vector3(0,0,0));
            rotateCameraY(that.camera, that.rotateYAmount);
            rotateCameraUpDown(that.camera, that.rotateXAmount);
        }

	}
    this.updateSkyDomeForFileName = function(fileName) {
        document.title = fileName;
        that.showToast("Loading '" + fileName + "'.", 2000);
        var pathToTexture = 'media/' + fileName + '.jpg';
        (new THREE.TextureLoader()).load(pathToTexture, function ( texture ) {
            var mat = that.setMaterialForTexture(texture);
            that.skyBox.material = mat;
            that.plane.material = mat;
        });
    }
    this.updateSkyDomeForFileObject = function(fileObject) {
        document.title = fileObject.name;
        that.showToast("Loading '" + fileObject.name + "'.", 2000);
        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function(theFile) {
            return function(e) {
                // var image = new Image();
                // image.src = e.target.result;
                var texture = THREE.ImageUtils.loadTexture( e.target.result );
                var mat = that.setMaterialForTexture(texture);
                that.skyBox.material = mat;
                that.plane.material = mat;
            };
        })(fileObject);

        // Read in the image file as a data URL.
        reader.readAsDataURL(fileObject);

    }
    this.toggleView = function(planeVisible) {
        if (planeVisible) {
            planeOnlyView();
        }
        else {
            sphereOnlyView();
        }
    }
    function sphereOnlyView() {
        that.skyBox.visible = true;
        that.plane.visible = false;
    }
    function planeOnlyView() {
        that.skyBox.visible = false;
        that.plane.visible = true;
    }
    // over-ride this to provide your own material,e.g. shader material:
    this.setMaterialForTexture = function(texture) {
            return new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide });            
    }
    this.initSkyBox = function() {
        var segment = 256.;
        var sphereRadius = 10;
        var skyGeometry = new THREE.SphereGeometry(sphereRadius,segment,segment);
		var newMaterial = new THREE.MeshNormalMaterial();
        that.skyBox = new THREE.Mesh( skyGeometry, newMaterial);
        that.scene.add( that.skyBox );
        that.skyBox.position.set(0,0,0);
        that.skyBox.scale.set(1,1,-1);

        // the plane is used for debuggin Mobius transforms and is hidden most of the time.
        var planeGeometry = new THREE.PlaneBufferGeometry( sphereRadius/8, sphereRadius/8, segment, segment );
        that.plane = new THREE.Mesh( planeGeometry, newMaterial );
        that.plane.rotateY(Math.PI/2);
        that.plane.visible = false;
        that.scene.add( that.plane );

    }
    this.cameraLeft = function() {
        that.rotateYAmount -= 0.002;
    }  
    this.cameraRight = function() {
        that.rotateYAmount += 0.002;
    }  
    this.cameraUp = function() {
        that.rotateXAmount -= 0.002;
    }  
    this.cameraDown = function() {
        that.rotateXAmount += 0.002;
    }  
    this.cameraStop = function() {
        that.rotateYAmount = 0.;
        that.rotateXAmount = 0.;
    }  
    this.flipCamera = function() {
    	that.camera.position.x = - that.camera.position.x;
    	that.camera.position.y = - that.camera.position.y;
    	that.camera.position.z = - that.camera.position.z;
    }
    this.narrowFOV = function() {
        that.FOV += 15;
        that.camera.fov = that.FOV;
        that.camera.updateProjectionMatrix();
    }
    this.widerFOV = function() {
        that.FOV -= 15;
        that.camera.fov = that.FOV;
        that.camera.updateProjectionMatrix();
    }
    this.initMediaUtils();
}