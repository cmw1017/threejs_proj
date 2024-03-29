import * as THREE from "/node_modules/three/build/three.module.js";
import { STLLoader } from "/node_modules/three/examples/jsm/loaders/STLLoader.js";
import { STLExporter } from "/node_modules/three/examples/jsm/exporters/STLExporter.js";

// Create some local variables for convenience
var state = false, // `true` when the simulation is running
    
    b2Vec2 = Box2D.Common.Math.b2Vec2,
    b2BodyDef = Box2D.Dynamics.b2BodyDef,
    b2Body = Box2D.Dynamics.b2Body,
    b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
    b2Fixture = Box2D.Dynamics.b2Fixture,
    b2World = Box2D.Dynamics.b2World,
    b2MassData = Box2D.Collision.Shapes.b2MassData,
    b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
    b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
    b2DebugDraw = Box2D.Dynamics.b2DebugDraw,
        
    viewport = document.getElementById( 'viewport' ), // The canvas element we're going to use
    
    // If your computer supports it, switch to the WebGLRenderer for a much smoother experience
    // most of the lag and jittering you see in the simulation is from the CanvasRenderer, not the physics
    //renderer = new THREE.CanvasRenderer({ canvas: viewport }), // Create the renderer
    renderer = new THREE.WebGLRenderer({ canvas: viewport }), // Create the renderer
    
    
    scene = new THREE.Scene, // Create the scene
    camera = new THREE.PerspectiveCamera( 35, 1, 1, 1000 ),
    
    ball_geometry = new THREE.SphereGeometry( 3 ), // Create the ball geometry with a radius of `3`
    ball_material = new THREE.MeshLambertMaterial({ color: 0x0000ff }), // Balls will be blue
    
    large_ball_geometry = new THREE.SphereGeometry( 4 ), // Create the ball geometry with a radius of `4`
    large_ball_material = new THREE.MeshLambertMaterial({ color: 0x00ff00 }), // Large balls are be green
    
    time_last_run, // used to calculate simulation delta
    
    world, // This will hold the box2dweb objects
    bodyDef = new b2BodyDef, // `bodyDef` will describe the type of bodies we're creating
    
    // Create a fixture definition
    //  `density` represents kilograms per meter squared.
    //        a denser object will have greater mass
    //    `friction` describes the friction between two objects
    //    `restitution` is how much "bounce" an object will have
    //        "0.0" is no restitution, "1.0" means the object won't lose velocity
    fixDef = new b2FixtureDef;
fixDef.density = 1.0;
fixDef.friction = 0.3;
fixDef.restitution = 0.3;

renderer.setSize( viewport.clientWidth, viewport.clientHeight );
scene.background = new THREE.Color( 0xffffff ); // 캔버스 색상 조정

camera.position.set( -10, 30, -200 );
camera.lookAt( scene.position ); // Look at the center of the scene
scene.add( camera );

function addLights() {
    var ambientLight = new THREE.AmbientLight( 0xffffff, 0.2 );
    scene.add( ambientLight );

    var directionalLight = new THREE.DirectionalLight( 0xffffff );
    directionalLight.position.set( -.5, .5, -1.5 ).normalize();
    scene.add( directionalLight );
}

function buildScene() {
    
     // Create the physics world
     world = new b2World(
        new b2Vec2( 0, -20 ), // Gravity
        true                  // Allow objects to sleep
    );
     
    
    bodyDef.type = b2Body.b2_staticBody; // Objects defined in this function are all static
    
    
    var ramp_geometry = new THREE.BoxGeometry( 50, 2, 20 ),
        material_red = new THREE.MeshLambertMaterial({ color: 0xdd0000 }),
        material_green = new THREE.MeshLambertMaterial({ color: 0x00bb00 });
    
    var ramp_1 = new THREE.Mesh( ramp_geometry, material_red );
    scene.add( ramp_1 );
    // position the ramp
    bodyDef.position.x = ramp_1.position.x = -30;
    bodyDef.position.y = ramp_1.position.y = 5;
    bodyDef.angle = ramp_1.rotation.z = Math.PI / 2;
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox( 25, 1 ); // "25" = half width of the ramp, "1" = half height
    bodyDef.userData = ramp_1; // Keep a reference to `ramp_1`
    world.CreateBody( bodyDef ).CreateFixture( fixDef ); // Add this physics body to the world
    
    
    var ramp_2 = new THREE.Mesh( ramp_geometry, material_red );
    scene.add( ramp_2 );
    // position the ramp
    bodyDef.position.x = ramp_2.position.x = 30;
    bodyDef.position.y = ramp_2.position.y = 5;
    bodyDef.angle = ramp_2.rotation.z = Math.PI / 2;
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox( 25, 1 ); // "25" = half width of the ramp, "1" = half height
    bodyDef.userData = ramp_2; // Keep a reference to `ramp_2`
    var body_a = world.CreateBody( bodyDef ).CreateFixture( fixDef ); // Add this physics body to the world

    
    var ramp_3 = new THREE.Mesh( new THREE.BoxGeometry( 70, 2, 10 ), material_red );
    scene.add( ramp_3 );
    // position the ramp
    bodyDef.position.x = ramp_3.position.x = 0;
    bodyDef.position.y = ramp_3.position.y = -20;
    bodyDef.angle = ramp_3.rotation.z = 0;
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox( 35, 1 ); // "35" = half width of the ramp, "1" = half height
    bodyDef.userData = ramp_3; // Keep a reference to `ramp_3`
    world.CreateBody( bodyDef ).CreateFixture( fixDef ); // Add this physics body to the world

    
}

function addBall() {
    var ball;
    
    if ( !state ) return;
    
    fixDef.shape = new b2CircleShape;
    
    if ( Math.random() >= .25 ) {
        ball = new THREE.Mesh( ball_geometry, ball_material );
        fixDef.shape.SetRadius( 3 );
    } else {
        ball = new THREE.Mesh( large_ball_geometry, large_ball_material );
        fixDef.shape.SetRadius( 4 );
    }
    
    scene.add( ball );
    bodyDef.type = b2Body.b2_dynamicBody; // balls can move
    bodyDef.position.y = ball.position.y = 50;
    bodyDef.position.x = Math.random() * 40 - 20; // Random positon between -20 and 20
    bodyDef.userData = ball; // Keep a reference to `ball`
    world.CreateBody( bodyDef ).CreateFixture( fixDef ); // Add this physics body to the world
}

function addMesh() {
    var mesh;

    if ( !state ) return;
    
    fixDef.shape = new b2CircleShape;

    const loader = new STLLoader();
	loader.load( 'stls/pack.stl', function ( geometry ) {

		const material = new THREE.MeshPhongMaterial( { color: 0xff5533, specular: 0x111111, shininess: 200 } );
		mesh = new THREE.Mesh( geometry, material );
        mesh.rotation.x = - Math.PI / 2;
		mesh.scale.set( 300, 300, 300 );
        fixDef.shape.SetRadius( 1.5 );
		mesh.castShadow = true;
		mesh.receiveShadow = true;

		scene.add( mesh );
        bodyDef.type = b2Body.b2_dynamicBody; // balls can move
        bodyDef.position.y = mesh.position.y = 50;
        bodyDef.position.x = Math.random() * 40 - 20; // Random positon between -20 and 20
        bodyDef.userData = mesh; // Keep a reference to `ball`
        world.CreateBody( bodyDef ).CreateFixture( fixDef ); // Add this physics body to the world
	} );

}

function updateWorld() {
    requestAnimationFrame( updateWorld );
    
    if ( !state ) return;
    
    var delta, now = (new Date()).getTime();
    
    if ( time_last_run ) {
        delta = ( now - time_last_run ) / 1000;
    } else {
        delta = 1 / 60;
    }
    time_last_run = now; 
    
    world.Step(
        delta * 2, // double the speed of the simulation
        10,        // velocity iterations
        10         // position iterations
    );
    
    // Update the scene objects
    var object = world.GetBodyList(), mesh, position;
    while ( object ) {
        mesh = object.GetUserData();
        
        if ( mesh ) {
            // Nice and simple, we only need to work with 2 dimensions
            position = object.GetPosition();
            mesh.position.x = position.x;
            mesh.position.y = position.y;
            
            // GetAngle() function returns the rotation in radians
            mesh.rotation.z = object.GetAngle();
        }
        
        object = object.GetNext(); // Get the next object in the scene
    }
    
    renderer.render( scene, camera );
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

addLights();
buildScene();

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

updateWorld();

setInterval( addMesh, 100 );


