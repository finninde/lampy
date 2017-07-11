(function(global) {
  class spinningCube extends NIN.THREENode {
    constructor(id, options) {
      super(id, {
        outputs: {
          render: new NIN.TextureOutput()
        }
      });

    console.log('Layer gets called');
    this.lampModel = new THREE.Object3D();
    console.log('creating loadobject function');
    var loadObject = function (objPath, material, three_object) {
      console.log('objLoader');
      var objLoader = new THREE.OBJLoader();
      console.log('Loader.loadajax');
      Loader.loadAjax(objPath, function(text) {
        console.log('now parsing');
        var object = objLoader.parse(text);
        console.log('now traversing');
        object.traverse(function(child) {
          if (child instanceof THREE.Mesh) {
            console.log('found mesh child');
            child.material = material;
          }
        });
        console.log('now adding');
        three_object.add(object);
      });
    };
    
    console.log('finished creating loadobject should be no syntax errors');
    console.log('now adding lampmodel using loadobject');
    loadObject('res/lamp/lamp.obj', 
               new THREE.MeshBasicMaterial({ color: 0x000fff }),
               this.lampModel );
    this.scene.add( this.lampModel );
    console.log('lampmodel added');
    var light = new THREE.PointLight(0x333333, 1, 100);
    console.log('setting lights');
    light.position.set(50, 50, 50);
    var anotherLight = new THREE.PointLight(0x00ffff, 1, 20);
    var pointLightHelper = new THREE.PointLightHelper(anotherLight, 2);
    anotherLight.position.set(0,0,0);
    this.scene.add(anotherLight);
    this.scene.add(light);
    this.scene.add(pointLightHelper);
    var spotLight = new THREE.SpotLight(0xff0000, 1, 2, 20, 10);
    spotLight.position.set(1,0.5,0.5);
    spotLight.target = this.lampModel;
    this.scene.add(spotLight);
    this.camera.position.z = 10;
    console.log('camera and light probz a ok');
    this.scene.add(new THREE.PointLightHelper(spotLight, 1));
      this.cube = new THREE.Mesh(new THREE.BoxGeometry(50, 5, 5),
                             new THREE.MeshBasicMaterial({ color: 0x000fff }));
    //  this.scene.add(this.cube);
    }

    update(frame) {
      super.update(frame);
      this.lampModel.rotation.x = Math.cos(frame / 10);
      //this.cube.rotation.x = Math.sin(frame / 10);
      //this.cube.rotation.y = Math.cos(frame / 10);
    }
  }

  global.spinningCube = spinningCube;
})(this);
