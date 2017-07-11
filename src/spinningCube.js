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
      debugger;
      Loader.loadAjax(objPath, function(text) {
        debugger;
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
    loadObject('lamp.obj', 
               new THREE.MeshStandardMaterial({
                 color: 0x119999,
                 side: THREE.DoubleSide,
                 roughness: 1
               }),
               this.lampModel );
    this.scene.add( this.lampModel );
    console.log('lampmodel added');
    var light = new THREE.PointLight(0x333333, 1, 100);
    console.log('setting lights');
    light.position.set(50, 50, 50);
    this.scene.add(light);
    this.camera.position.z = 100;
    console.log('camera and light probz a ok');
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
