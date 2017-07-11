(function(global) {
  class spinningCube extends NIN.THREENode {
    constructor(id, options) {
      super(id, {
        outputs: {
          render: new NIN.TextureOutput()
        }
      });

      this.lampModel = new THREE.Object3D();
      var loadObject = function (objPath, material, three_object) {
        var objLoader = new THREE.OBJLoader();
        Loader.loadAjax(objPath, function(text) {
          var object = objLoader.parse(text);
          object.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
              child.material = material;
              child.material.side = THREE.DoubleSide;
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          three_object.add(object);
        });
      };

      var bestMaterial = new THREE.MeshPhysicalMaterial({ color: 0x000fff, shading: THREE.SmoothShading });

      loadObject('res/lamp/lamp.obj', bestMaterial, this.lampModel );
      this.scene.add( this.lampModel );


      var floorMat = new THREE.MeshStandardMaterial( {
          roughness: 0.8,
          color: 0xffffff,
          metalness: 0.2,
          bumpScale: 0.0005
        });
      var floorCubeGeometry = new THREE.BoxGeometry(200,1,200);
      var floorGeometry = new THREE.PlaneBufferGeometry( 20, 20 );
      this.floorCube = new THREE.Mesh(
        // floorGeometry,
        floorCubeGeometry,

        floorMat
        // new THREE.MeshPhysicalMaterial({ color: 0xff0000, shading: THREE.SmoothShading })
      );
      this.floorCube.receiveShadow = true;
      // this.floorCube.x = -Math.PI / 2.0;
      this.floorCube.position.set(0,-2,0);
      this.scene.add(this.floorCube);



      this.anotherLight = new THREE.PointLight(0xffffff, 1, 5, 2);
      this.anotherLight.position.set(0,0,0);
      this.anotherLight.physicallyCorrectLights = true;
      this.anotherLight.castShadow = true;
      var pointLightHelper = new THREE.PointLightHelper(this.anotherLight, 2);
      this.scene.add(this.anotherLight);

      // var light = new THREE.SpotLight( 0xffffff );
      // light.castShadow = true;
      // light.position.set(0,0,0);
      // this.scene.add( light );

      this.camera.position.z = 10;
    }

    update(frame) {
      super.update(frame);
      this.lampModel.rotation.x = Math.cos(frame / 10);
      this.floorCube.needsUpdate = true;
      //this.cube.rotation.x = Math.sin(frame / 10);
      //this.cube.rotation.y = Math.cos(frame / 10);
    }
  }

  global.spinningCube = spinningCube;
})(this);
