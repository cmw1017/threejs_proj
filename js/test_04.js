import * as THREE from "/node_modules/three/build/three.module.js";
import { STLLoader } from "/node_modules/three/examples/jsm/loaders/STLLoader.js";
import { STLExporter } from "/node_modules/three/examples/jsm/exporters/STLExporter.js";

window.onload = function main() { 
    let camera, scene, renderer;

		function init() {
			const output = document.createElement('div');
   			output.id = 'output'
   			document.getElementsByTagName('body')[0].appendChild(output);
			
   			scene = new THREE.Scene();
   			renderer = new THREE.WebGLRenderer();
   			renderer.setClearColor(0xeeeeee);
   			renderer.setSize(window.innerWidth, window.innerHeight);
   			renderer.shadowMap.enabled = true;
			
   			const planeGeometry = new THREE.PlaneGeometry(60, 20);
   			const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
   			const plane = new THREE.Mesh(planeGeometry, planeMaterial);
			
   			const cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
   			const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
   			const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
			
   			const sphereGeometry = new THREE.SphereGeometry(4, 4, 4);
   			const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
   			const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
			
   			const loader = new STLLoader();
				loader.load( 'stls/file_pack.stl', function ( geometry ) {

					const material = new THREE.MeshPhongMaterial( { color: 0xff5533, specular: 0x111111, shininess: 200 } );
					const mesh = new THREE.Mesh( geometry, material );

					mesh.position.set( 0, 0, 15 );
					mesh.scale.set( 200, 200, 200 );

					mesh.castShadow = true;
					mesh.receiveShadow = true;

					scene.add( mesh );

				} );
			
   			plane.castShadow = true;
   			plane.receiveShadow = true;
   			cube.castShadow = true;
   			cube.receiveShadow = true;
   			sphere.castShadow = true;
   			sphere.receiveShadow = true;
			
   			plane.position.set(0, 0, 0);
   			cube.position.set(15, 0, 15);
   			sphere.position.set(0, 0, 15);
			
   			camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.2, 1000);
   			camera.position.set(100, 100, 100);
   			camera.lookAt(scene.position);
			
   			const spotLight = new THREE.SpotLight(0xffffff);
   			spotLight.position.set(0, 0, 100);
   			spotLight.castShadow = true;
			
   			// scene.add(plane);
   			scene.add(cube);
   			// scene.add(sphere);
   			scene.add(spotLight);
			
			
   			document.getElementById("output").appendChild(renderer.domElement);
		}

		function animate() {
			requestAnimationFrame( animate );
		
			renderer.render(scene, camera);
		}
  
   		function saveSTL( scene, name ){  
   		  var exporter = new STLExporter();
   		  var blob = new Blob( [ exporter.parse( scene ) ] );
   		  var a = document.body.appendChild( document.createElement( 'a' ) );
   		  a.href = window.URL.createObjectURL( blob );
   		  a.download = name + '.stl';
   		  a.click();
   		}


   		document.getElementById( 'export' ).addEventListener('click',
   		    function() {
   		        saveSTL( scene, "file")
   		    }
   		)
		
		init();
		animate();
  }