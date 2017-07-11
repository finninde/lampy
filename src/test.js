/**
 * @constructor
 */
function phonographLayer(layer, demo) {
  this.blackoutMaterial = new THREE.MeshBasicMaterial({color: 0});

  var pointLight = new THREE.PointLight(0x505050);
  pointLight.position.set(0, 5, 0);
  this.scene.add(pointLight);

  this.spotLight = new THREE.DirectionalLight(0xffffff, 0.5);
  this.scene.add(this.spotLight);

  var amb = new THREE.AmbientLight(0xb0b0b0);
  this.scene.add(amb);

  this.initPhonographModel();
}

phonographLayer.prototype.initPhonographModel = function() {
  var that = this;
  var prefix = 'res/lamp/‘;
  var lightGrayMaterial = new THREE.MeshStandardMaterial({
    color: 0x727272,
    side: THREE.DoubleSide
  });

  var blackMaterial = new THREE.MeshStandardMaterial({
    color: 0,
    side: THREE.DoubleSide
  });

  this.phonographModel = new THREE.Object3D();
  var that = this;
  var loadObject = function(objPath, offset, material, callback) {
    var objLoader = new THREE.OBJLoader();
    Loader.loadAjax(objPath, function(text) {
      var object = objLoader.parse(text);
      object.traverse(function(child) {
        if (child instanceof THREE.Mesh) {
                      child.renderMaterial = lightGrayMaterial;
        }
      });

      var pivot = new THREE.Object3D();
      pivot.position.set(-offset.x, -offset.y, -offset.z);
      object.position.set(
        object.position.x + offset.x,
        object.position.y + offset.y,
        object.position.z + offset.z
      );
      pivot.add(object);

      callback(pivot);
    });
  };
  loadObject(
    prefix + ‘lamp.obj',
    {x: 0, y: 0, z: 0},
    this.blackoutMaterial,
    function(object) {
      that.phonoGraphObject = object;
      that.phonographModel.add(object);
    }
  );
  loadObject(
    prefix + 'record.obj',
    {x: -0.5925, y: 0, z: 2.237},
    new THREE.MeshStandardMaterial({
      map: Loader.loadTexture(prefix + 'hismastervoice/text_disco.jpg')
    }),
    function(object) {
      that.recordObject = object;
      that.recordObject.position.set(
        object.position.x - 0.151,
        object.position.y - 0.005,
        object.position.z + 0.115
      );
      that.phonographModel.add(object);
    }
  );
  loadObject(
    prefix + 'handle.obj',
    {x: 0.64971, y: -0.40482, z: 2.1225},
    new THREE.MeshStandardMaterial({
      map: Loader.loadTexture(prefix + 'hismastervoice/Wood_Cherry_Original.jpg')
    }),
    function(object) {
      that.handleObject = object;
      that.phonographModel.add(object);
    }
  );
  this.initParticles(new THREE.Mesh(new THREE.BoxGeometry(0.2,0.2,0.2), new THREE.MeshBasicMaterial({color: 0xffffff})));
  this.scene.add(this.phonographModel);
};

phonographLayer.prototype.initParticles = function(mesh) {
  this.particles = [];
  this.numParticles = 100;
  this.materials = [];
  for (var i = 0; i < this.numParticles; i++) {
    var material = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true});
    this.materials.push(material);
    var particle = mesh.clone();
    particle.material = material;
    particle.scale.set(0.02, 0.02, 0.02);
    particle.position.set(this.particleSpawnPosition[0], this.particleSpawnPosition[1], this.particleSpawnPosition[2]);
    particle.userData.startedAt = null;
    particle.userData.direction = [
      0.5 * Math.sin(i * 97),
      0.5 * Math.sin(i * 67 + 1),
      0.5 * Math.sin(i * 167 + 2)
    ];
    this.scene.add(particle);
    this.particles.push(particle);
  }
  this.currentParticleIndex = 0;
};

phonographLayer.prototype.getEffectComposerPass = function() {
  return this.addPass;
};

phonographLayer.prototype.start = function() {
  this.zoomAccumulator = 0;
};

phonographLayer.prototype.end = function() {
};

phonographLayer.prototype.resize = function() {
  this.glowEffectComposer.setSize(16 * GU, 9 * GU);
  this.finalEffectComposer.setSize(16 * GU, 9 * GU);
};

phonographLayer.prototype.updateSpinwires = function(frame, relativeFrame) {
  this.barLightGodRay.material.uniforms.time.value = frame;
  var lightOpening = lerp(0, 1, (relativeFrame - 150) / 60);
  this.shaderMaterial.uniforms.lightOpening.value = lightOpening;
  this.barLight.scale.z = lightOpening;
  this.barLightGodRay.scale.z = lightOpening;
  if (lightOpening == 0) {
    this.barLight.position.y = -0.001;
    this.barLightGodRay.scale.y = 0.000000000001;
  } else {
    this.barLight.position.y = .0001;
    this.barLightGodRay.scale.y = 1;
  }
  this.barLight.position.x = 0;
  this.barLight.position.y = -0.001;
  this.barLight.position.z = 0 - 0.03 / 2 + lightOpening * 0.03 / 2;
  this.barLightGodRay.position.x = 0;
  this.barLightGodRay.position.y = -0.05;
  this.barLightGodRay.position.z = - 0.03 / 2 + lightOpening * 0.03 / 2;
  this.barLightHolder.position.x = 0;
  this.barLightHolder.position.y = 0;
  this.barLightHolder.position.z = 0;
  this.mainObject.rotation.set(0, 0.01 * (frame - 4873), 0);
  this.lightCentersActive = relativeFrame > 210;

  this.mainObject.position.x = 0;
  this.mainObject.position.y = 0;
  this.mainObject.position.z = 0;

  this.spinwireContainer.position.x = 0.441;
  this.spinwireContainer.position.y = 0.61;
  this.spinwireContainer.position.z = -2.118;
  this.spinwireContainer.rotation.y = Math.PI;

  for (var i = 0; i < this.lights.length; i++) {
    var light = this.lights[i];
    var lightCenter = this.lightCenters[i];
    light.position.copy(this.curves[i].getPoint((0.25 + 100 - 0.01 * relativeFrame / Math.PI / 2) % 1));
    lightCenter.position.copy(light.position);
  }
};

phonographLayer.prototype.updateParticles = function(frame, relativeFrame) {
  if (!this.particles || BEAN > 1056) {
    return;
  }

  var soundIntensity = this.guitarAnalysis.getValue(frame) * (BEAN < 1056 ? 1 : 0) +
    this.snareAnalysis.getValue(frame) +
    1.5 * this.kickAnalysis.getValue(frame);
  var soundIntensityDiff = soundIntensity - this.previousSoundIntensity;

  var numNewParticles = 0 | Math.max(0, (BEAN < 1056 ? 1 : 2.5) * soundIntensityDiff + 0.5);

  var smoothSoundIntensity = this.smoothSnareAnalysis.getValue(frame) + this.smoothKickAnalysis.getValue(frame);

  for (var i = 0; i < this.numParticles; i++) {
    var particle = this.particles[i];
    var relativeIndex = i - this.currentParticleIndex;
    if (relativeIndex >= 0 && relativeIndex < numNewParticles) {
      particle.userData.startedAt = relativeFrame;
    }
    if (null === particle.userData.startedAt && particle.userData.startedAt >= relativeFrame) {
      this.scene.remove(particle);
    } else {
      this.scene.add(particle);
      var progress = Math.sqrt(0.01 * (relativeFrame - particle.userData.startedAt));
      if (progress > 1) {
        particle.userData.startedAt = null;
      }
      var material = this.materials[i];
      material.opacity = 1 - progress;
      var displacementFactor = (1 - progress) * 0.09 * Math.max(smoothSoundIntensity, 0);
      var displacementOffset = 0.6;
      particle.position.set(
        this.particleSpawnPosition[0] + progress * (this.particleDirection[0] + (displacementOffset + displacementFactor) * particle.userData.direction[0]),
        this.particleSpawnPosition[1] + progress * (this.particleDirection[1] + (displacementOffset + displacementFactor) * particle.userData.direction[1]),
        this.particleSpawnPosition[2] + progress * (this.particleDirection[2] + (displacementOffset + displacementFactor) * particle.userData.direction[2])
      );
      var particleScale = 0.1 * (0.8 + (1 - progress) * 0.3 * smoothSoundIntensity);

      particle.scale.set(particleScale, particleScale, particleScale)
    }
  }
  this.currentParticleIndex = (this.currentParticleIndex + numNewParticles) % this.numParticles;
  this.previousSoundIntensity = soundIntensity;
};

phonographLayer.prototype.update = function(frame, relativeFrame) {
  this.updateSpinwires(frame, relativeFrame - 887);

  var opacityTimer = (relativeFrame - 750) / 240;
  this.refractionMaterial.opacity = smoothstep(0, 0.6, opacityTimer);

  this.cameraController.updateCamera(relativeFrame);

  var relativeBEAN = BEAN - BEAN_FOR_FRAME(this.startFrame);
  if (relativeBEAN > 168 && relativeBEAN < 192) {
    if (BEAT && BEAN % 6 == 0) {
      this.zoomAccumulator += 5;
    } else if (relativeFrame >= 888) {
      this.zoomAccumulator = 0;
    }
    this.camera.fov = 45 - this.zoomAccumulator;
    this.camera.updateProjectionMatrix();
  }

  this.handHeldCameraModifier.update(this.camera);

  this.spotLight.rotation.copy(this.camera.rotation);

  this.updateParticles(frame, relativeFrame);

  if (this.recordObject) {
    this.recordObject.rotation.set(0, 0.01 * relativeFrame, 0);
  }
  if (this.handleObject) {
    this.handleObject.rotation.set(-0.08 * relativeFrame, 0, 0);
  }
};

phonographLayer.prototype.render = function(renderer, interpolation) {
  this.rigMaterialsForGlowPass();
  this.glowEffectComposer.render();
  this.rigMaterialsForRenderPass();
  this.finalEffectComposer.render();
  this.addPass.uniforms.tA.value = this.finalEffectComposer.renderTarget2;
  this.addPass.uniforms.tB.value = this.glowEffectComposer.renderTarget2;
};


phonographLayer.glowTraverse = function(object) {
  for (var i = 0; i < object.children.length; i++) {
    phonographLayer.glowTraverse(object.children[i]);
  }
  if (object instanceof THREE.Mesh) {
    object.material = object.glowMaterial;
  }
};

phonographLayer.renderTraverse = function(object) {
  for (var i = 0; i < object.children.length; i++) {
    phonographLayer.renderTraverse(object.children[i]);
  }
  if (object instanceof THREE.Mesh) {
    object.material = object.renderMaterial;
  }
};

phonographLayer.prototype.rigMaterialsForGlowPass = function() {
  for (var i = 0; i < this.tubes.length; i++) {
    this.tubes[i].material = this.shaderMaterial;
    this.mainObject.remove(this.lights[i]);
    if (this.lightCentersActive) {
      this.mainObject.add(this.lightCenters[i]);
    }
  }
  this.barLightHolder.material = this.blackoutMaterial;
  this.scene.remove(this.skyBox);
  this.barLightContainer.add(this.barLightGodRay);
  this.spinwireContainer.add(this.barLightContainer);
  this.spinwireContainer.add(this.mainObject);
  phonographLayer.glowTraverse(this.phonographModel, 'glowMaterial');
};

phonographLayer.prototype.rigMaterialsForRenderPass = function() {
  for (var i = 0; i < this.tubes.length; i++) {
    this.tubes[i].material = this.refractionMaterial;
    this.mainObject.add(this.lights[i]);
    this.mainObject.remove(this.lightCenters[i]);
  }
  this.barLightContainer.remove(this.barLightGodRay);
  this.barLightHolder.material = this.barLightHolderRenderMaterial;
  this.scene.add(this.skyBox);
  this.spinwireContainer.add(this.mainObject);
  phonographLayer.renderTraverse(this.phonographModel);
};

phonographLayer.prototype.initSpinwires = function() {
  this.barLightHolderRenderMaterial = new THREE.MeshStandardMaterial({
    map: Loader.loadTexture('res/floor.jpg')
  });

  var skyGeometry = new THREE.BoxGeometry(10, 10, 10);

  var skyBox = new THREE.Mesh(skyGeometry, new THREE.MeshStandardMaterial({
    map: Loader.loadTexture('res/paper_old.jpg'),
    side: THREE.BackSide
  }));
  skyBox.position.set(0, 5.2, 0);
  this.scene.add(skyBox);
  this.skyBox = skyBox;

  this.barLightContainer = new THREE.Object3D();
  this.spinwireContainer = new THREE.Object3D();
  this.scene.add(this.spinwireContainer);
  this.spinwireContainer.add(this.barLightContainer);
  this.barLightContainer.position.z = -0.12;
  this.barLightContainer.position.y = 0.06;

  this.barLightHolder = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.004, 0.04), this.barLightHolderRenderMaterial);
  this.barLightContainer.add(this.barLightHolder);

  this.barLight = new THREE.Mesh(
    new THREE.BoxGeometry(.005, .002, 0.03),
    new THREE.MeshBasicMaterial());
  this.barLightContainer.add(this.barLight);

  this.barLightGodRay = new THREE.Mesh(
    new THREE.BoxGeometry(0.005, 0.1, 0.03),
    new THREE.ShaderMaterial(SHADERS.godray));
  this.barLightGodRay.material.transparent = true;
  this.barLightContainer.add(this.barLightGodRay);

  this.ceilingLight = new THREE.PointLight({
    color: 0xddffff
  });
  this.ceilingLight.intensity = 0.2;
  this.ceilingLight.position.x = 0;
  this.ceilingLight.position.y = 100;
  this.ceilingLight.position.z = 0;
  this.scene.add(this.ceilingLight);

  this.ambientLight = new THREE.AmbientLight(0x202020);
  this.scene.add(this.ambientLight);

  this.cubeGeometry = new THREE.BoxGeometry(10, 10, 10);
  this.cubeGeometry.vertices.push(new THREE.Vector3(5, 0, 5));
  this.cubeGeometry.vertices.push(new THREE.Vector3(-5, 0, 5));
  this.cubeGeometry.vertices.push(new THREE.Vector3(5, 0, -5));
  this.cubeGeometry.vertices.push(new THREE.Vector3(-5, 0, -5));
  this.cubeGeometry.vertices.push(new THREE.Vector3(0, 5, 5));
  this.cubeGeometry.vertices.push(new THREE.Vector3(0, -5, 5));
  this.cubeGeometry.vertices.push(new THREE.Vector3(0, 5, -5));
  this.cubeGeometry.vertices.push(new THREE.Vector3(0, -5, -5));
  this.geometries = [];

  this.wireframeMaterial = new THREE.MeshBasicMaterial({wireframe: true});

  this.cube = new THREE.Mesh(this.cubeGeometry, this.wireframeMaterial);

  var projectionCamera = new THREE.PerspectiveCamera(45, 16 / 9, 1, 10000);
  projectionCamera.position.x = 0;
  projectionCamera.position.y = 0;
  projectionCamera.position.z = 200;
  projectionCamera.lookAt(new THREE.Vector3(0, 0, 0));

  for (var i = 0; i < 32; i++) {
    this.cube.rotation.x = Math.PI * 2 * i / 32 * 2;
    this.cube.rotation.z = Math.PI * 2 * i / 32;
    this.cube.updateMatrix();
    projectionCamera.updateMatrix();
    projectionCamera.updateMatrixWorld();
    this.scene.updateMatrixWorld();
    var geometry = this.cubeGeometry.clone();
    this.geometries.push(geometry);
    var modelViewMatrix = this.cube.matrixWorld.clone().multiply(projectionCamera.matrixWorldInverse);
    geometry.applyMatrix(this.cube.matrix);
    geometry.applyMatrix(modelViewMatrix);
    geometry.applyMatrix(projectionCamera.projectionMatrix);
    for (var j = 0; j < geometry.vertices.length; j++) {
      geometry.vertices[j].z = 0;
    }
    geometry.verticesNeedUpdate = true;
  }

  this.curves = [];
  this.tubes = [];
  this.tubeGeometries = [];
  this.lights = [];
  this.lightCenters = [];
  var lightCenterGeometry = new THREE.SphereGeometry(0.85, 32, 32);
  this.mainObject = new THREE.Object3D();
  this.spinwireContainer.add(this.mainObject);
  var scale = 0.0012;
  this.mainObject.scale.set(scale, scale, scale);
  for (var i = 0; i < this.cube.geometry.vertices.length; i++) {
    var points = [];
    for (var j = 0; j < this.geometries.length; j++) {
      var point = this.geometries[j].vertices[i].clone();
      var rotation = new THREE.Matrix4();
      point.x += 100;
      rotation.makeRotationY(Math.PI * 2 * j / this.geometries.length);
      point.applyMatrix4(rotation);
      points.push(point);
    }
    points.push(points[0]);
    var curve = new THREE.CatmullRomCurve3(points);
    this.curves.push(curve);
    var tubeGeometry = new THREE.TubeGeometryEx(curve, 64, 1, 4);
    var shaderMaterial = new THREE.ShaderMaterial(SHADERS.spinwires);
    shaderMaterial.transparent = true;
    this.shaderMaterial = shaderMaterial;
    var refractionMaterial = new THREE.MeshBasicMaterial({
      wireframe: true,
      color: 0x598ea5,
      shading: THREE.FlatShading,
      transparent: true,
      opacity: 0.0
    });
    this.refractionMaterial = refractionMaterial;
    var tube = new THREE.Mesh(new THREE.BufferGeometry().fromGeometry(tubeGeometry), this.refractionMaterial);
    tubeGeometry.computeFaceNormals();
    tubeGeometry.computeVertexNormals();
    this.tubeGeometries.push(tubeGeometry);
    this.tubes.push(tube);
    this.mainObject.add(tube);
    var light = new THREE.PointLight();
    light.intensity = 0.001;
    this.mainObject.add(light);
    this.lights.push(light);
    var lightCenter = new THREE.Mesh(lightCenterGeometry, new THREE.MeshBasicMaterial({
      color: 0xcccccc
    }));
    this.mainObject.add(lightCenter);
    this.lightCenters.push(lightCenter);
  }
  this.spinwireContainer.add(this.mainObject);
};
