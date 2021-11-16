import * as THREE from "/node_modules/three/build/three.module.js";
import Stats from "/node_modules/three/examples/jsm/libs/stats.module.js";
import { OrbitControls } from "/node_modules/three/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "/node_modules/three/examples/jsm/loaders/STLLoader.js";
import { GLTFLoader } from "/node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { STLExporter } from "/node_modules/three/examples/jsm/exporters/STLExporter.js";


// Graphics variables
let container;
let camera, controls, scene, renderer;
// let textureLoader;
const clock = new THREE.Clock();

// Physics variables
const gravityConstant = - 9.8;
let collisionConfiguration;
let dispatcher;
let broadphase;
let solver;
let softBodySolver;
let physicsWorld;
const rigidBodies = [];
const margin = 0.05;
let transformAux1;

Ammo().then( function ( AmmoLib ) {

	Ammo = AmmoLib;

	init();
	animate();

} );

function init() {

	initGraphics();

	initPhysics();

	createObjects();

	document.getElementById( 'startStop' ).addEventListener('click',
        function() {
            if ( this.innerHTML === 'Start' ) {
                this.innerHTML = 'Stop';
                time_last_run = (new Date()).getTime();
                state = true;
            } else {
                this.innerHTML = 'Start';
                state = false;
            }
        }
    )
    
    
    document.getElementById( 'export' ).addEventListener('click',
        function() {
            saveSTL( scene, "file")
        }
    )

}

function initGraphics() {

	container = document.getElementById( 'container' );

	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.2, 2000 );

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xbfd1e5 );

	camera.position.set( - 7, 5, 8 );

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMap.enabled = true;
	container.appendChild( renderer.domElement );

	controls = new OrbitControls( camera, renderer.domElement );
	controls.target.set( 0, 2, 0 );
	controls.update();

	const ambientLight = new THREE.AmbientLight( 0x404040 );
	scene.add( ambientLight );

	const light = new THREE.DirectionalLight( 0xffffff, 1 );
	light.position.set( - 10, 10, 5 );
	light.castShadow = true;
	const d = 10;
	light.shadow.camera.left = - d;
	light.shadow.camera.right = d;
	light.shadow.camera.top = d;
	light.shadow.camera.bottom = - d;

	light.shadow.camera.near = 2;
	light.shadow.camera.far = 50;

	light.shadow.mapSize.x = 1024;
	light.shadow.mapSize.y = 1024;

	scene.add( light );

	window.addEventListener( 'resize', onWindowResize );

}

function initPhysics() {

	// Physics configuration

	collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
	dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
	broadphase = new Ammo.btDbvtBroadphase();
	solver = new Ammo.btSequentialImpulseConstraintSolver();
	softBodySolver = new Ammo.btDefaultSoftBodySolver();
	physicsWorld = new Ammo.btSoftRigidDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration, softBodySolver );
	physicsWorld.setGravity( new Ammo.btVector3( 0, gravityConstant, 0 ) );
	physicsWorld.getWorldInfo().set_m_gravity( new Ammo.btVector3( 0, gravityConstant, 0 ) );

	transformAux1 = new Ammo.btTransform();

}

function createObjects() {

	const pos = new THREE.Vector3();
	const quat = new THREE.Quaternion();

	// Ground
	pos.set( 0, - 0.5, 0 );
	quat.set( 0, 0, 0, 1 );
	const ground = createParalellepiped( 40, 1, 40, 0, pos, quat, new THREE.MeshPhongMaterial( { color: 0xFFFFFF } ) );
	ground.castShadow = true;
	ground.receiveShadow = true;
	// textureLoader.load( "textures/grid.png", function ( texture ) {

	// 	texture.wrapS = THREE.RepeatWrapping;
	// 	texture.wrapT = THREE.RepeatWrapping;
	// 	texture.repeat.set( 40, 40 );
	// 	ground.material.map = texture;
	// 	ground.material.needsUpdate = true;

	// } );


	// // Ball
	// const ballMass = 1.2;
	// const ballRadius = 0.6;

	// const ball = new THREE.Mesh( new THREE.SphereGeometry( ballRadius, 20, 20 ), new THREE.MeshPhongMaterial( { color: 0x202020 } ) );
	// ball.castShadow = true;
	// ball.receiveShadow = true;
	// const ballShape = new Ammo.btSphereShape( ballRadius );
	// ballShape.setMargin( margin );
	// pos.set( 0, 10, 0 );
	// quat.set( 0, 0, 0, 1 );
	// createRigidBody( ball, ballShape, ballMass, pos, quat );
	// ball.userData.physicsBody.setFriction( 0.5 );

	// // Wall
	// const brickMass = 0.5;
	// const brickLength = 1.2;
	// const brickDepth = 0.6;
	// const brickHeight = brickLength * 0.5;
    // const numBricks = 30;

	// quat.set( 0, 0, 0, 1 );

    // for ( let j = 0; j < numBricks; j ++ ) {
    //     pos.set( Math.random() * 5 - 2.5, Math.random() * 5 - 2.5, Math.random() * 5 - 2.5);
	// 	   const brick = createParalellepiped( brickDepth, brickHeight, brickLength, brickMass, pos, quat, createMaterial() );
	// 	   brick.castShadow = true;
	// 	   brick.receiveShadow = true;
    // }

    // Mesh
	const meshMass = 1.2;
    const numMeshs = 50;
    quat.set( 0, 0, 0, 1 );

    for ( let j = 0; j < numMeshs; j ++ ) {
		createMesh( meshMass, pos, quat, createMaterial() );
    }
}

function createMesh( mass, pos, quat, material ) {
    const loader = new STLLoader();
	loader.load( 'stls/pr2_head_pan.stl', function ( geometry ) {

        const threeObject = new THREE.Mesh( geometry, material );
		threeObject.scale.set( 1, 1, 1 );
        threeObject.castShadow = true;
		threeObject.receiveShadow = true;

        const shape = createTriangleShapeByBufferGeometry(geometry, 1);

		// const ballShape = new Ammo.btSphereShape( 0.6 );
        // ballShape.setMargin( margin );
        pos.set( Math.random() * 3 - 1.5, Math.random() * 10 - 5, Math.random() * 3 - 1.5);
	    createRigidBody( threeObject, shape, mass, pos, quat );
	} );
}

function createParalellepiped( sx, sy, sz, mass, pos, quat, material ) {

	const threeObject = new THREE.Mesh( new THREE.BoxGeometry( sx, sy, sz, 1, 1, 1 ), material );
	const shape = new Ammo.btBoxShape( new Ammo.btVector3( sx * 0.5, sy * 0.5, sz * 0.5 ) );
	shape.setMargin( margin );

	createRigidBody( threeObject, shape, mass, pos, quat );

	return threeObject;

}

// function createTriangleShapeByBufferGeometry(geometry, scalingFactor) {
//     const mesh = new Ammo.btTriangleMesh(true, true);
//     const vertices = geometry.attributes.position?.array || [];
//     const indices = geometry.index?.array || [];
//     for (let i = 0; i * 3 < indices.length; i += 1) {
//       mesh.addTriangle(
//         new Ammo.btVector3(
//           vertices[indices[i * 3] * 3]*scalingFactor,
//           vertices[indices[i * 3] * 3 + 1]*scalingFactor,
//           vertices[indices[i * 3] * 3 + 2]*scalingFactor
//         ),
//         new Ammo.btVector3(
//           vertices[indices[i * 3 + 1] * 3]*scalingFactor,
//           vertices[indices[i * 3 + 1] * 3 + 1]*scalingFactor,
//           vertices[indices[i * 3 + 1] * 3 + 2]*scalingFactor
//         ),
//         new Ammo.btVector3(
//           vertices[indices[i * 3 + 2] * 3]*scalingFactor,
//           vertices[indices[i * 3 + 2] * 3 + 1]*scalingFactor,
//           vertices[indices[i * 3 + 2] * 3 + 2]*scalingFactor
//         ),
//         false
//       );
//     }
//     const shape = new Ammo.btConvexTriangleMeshShape(mesh, true, true);
//     return shape;
// }

function createTriangleShapeByBufferGeometry(geometry, scalingFactor) {
    // console.log(geometry.attributes.position.count/3)
    const mesh = new Ammo.btTriangleMesh(true, true);
    const vertexPositionArray = geometry.attributes.position.array;
    for (var i = 0; i < geometry.attributes.position.count/3; i++) {
        mesh.addTriangle(
            new Ammo.btVector3(vertexPositionArray[i*9+0]*scalingFactor, vertexPositionArray[i*9+1]*scalingFactor, vertexPositionArray[i*9+2]*scalingFactor),
            new Ammo.btVector3(vertexPositionArray[i*9+3]*scalingFactor, vertexPositionArray[i*9+4]*scalingFactor, vertexPositionArray[i*9+5]*scalingFactor),
            new Ammo.btVector3(vertexPositionArray[i*9+6]*scalingFactor, vertexPositionArray[i*9+7]*scalingFactor, vertexPositionArray[i*9+8]*scalingFactor),
            false
        );
	}
    const shape = new Ammo.btBvhTriangleMeshShape(mesh, true, true);
    return shape;
}


function createRigidBody( threeObject, physicsShape, mass, pos, quat ) {

	threeObject.position.copy( pos );
	threeObject.quaternion.copy( quat );

	const transform = new Ammo.btTransform();
	transform.setIdentity();
	transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
	transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
	const motionState = new Ammo.btDefaultMotionState( transform );

	const localInertia = new Ammo.btVector3( 0, 0, 0 );
	physicsShape.calculateLocalInertia( mass, localInertia );

	const rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, physicsShape, localInertia );
	const body = new Ammo.btRigidBody( rbInfo );

	threeObject.userData.physicsBody = body;

	scene.add( threeObject );

	if ( mass > 0 ) {

		rigidBodies.push( threeObject );

		// Disable deactivation
		body.setActivationState( 4 );

	}

	physicsWorld.addRigidBody( body );

}

function createRandomColor() {

	return Math.floor( Math.random() * ( 1 << 24 ) );

}

function createMaterial() {

	return new THREE.MeshPhongMaterial( { color: createRandomColor() } );

}


function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	requestAnimationFrame( animate );

	render();

}

function render() {

	const deltaTime = clock.getDelta();

	updatePhysics( deltaTime );

	renderer.render( scene, camera );

}

function updatePhysics( deltaTime ) {


	// Step world
	physicsWorld.stepSimulation( deltaTime, 10 );

	// Update rigid bodies
	for ( let i = 0, il = rigidBodies.length; i < il; i ++ ) {

		const objThree = rigidBodies[ i ];
		const objPhys = objThree.userData.physicsBody;
		const ms = objPhys.getMotionState();
		if ( ms ) {

			ms.getWorldTransform( transformAux1 );
			const p = transformAux1.getOrigin();
			const q = transformAux1.getRotation();
			objThree.position.set( p.x(), p.y(), p.z() );
			objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

		}

	}

}

function saveSTL( scene, name ){  
    var exporter = new STLExporter();
	var blob = new Blob( [ exporter.parse( scene ) ] );
	var a = document.body.appendChild( document.createElement( 'a' ) );
	a.href = window.URL.createObjectURL( blob );
	a.download = name + '.stl';
	a.click();
	// delete a;
}