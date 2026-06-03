import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

function main() {

    const canvas = document.querySelector( '#c' );
    
    const renderer = new THREE.WebGLRenderer( {
        canvas,
        logarithmicDepthBuffer: true,
        antialias: true
    } );
    
    RectAreaLightUniformsLib.init();

    const fov = 45;
    const aspect = 2; 
    const near = 0.00001;
    const far = 100;
    const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
    camera.position.set( 0, 10, 20 );

    const controls = new OrbitControls( camera, canvas );
    controls.target.set( 0, 5, 0 );
    controls.update();

    const scene = new THREE.Scene();

    class ColorGUIHelper {
        constructor( object, prop ) {
            this.object = object;
            this.prop = prop;
        }
        get value() {
            return `#${this.object[ this.prop ].getHexString()}`;
        }
        set value( hexString ) {
            this.object[ this.prop ].set( hexString );
        }
    }

    class DegRadHelper {
        constructor( obj, prop ) {
            this.obj = obj;
            this.prop = prop;
        }
        get value() {
            return THREE.MathUtils.radToDeg( this.obj[ this.prop ] );
        }
        set value( v ) {
            this.obj[ this.prop ] = THREE.MathUtils.degToRad( v );
        }
    }

    class MinMaxGUIHelper {
        constructor( obj, minProp, maxProp, minDif ) {
            this.obj = obj;
            this.minProp = minProp;
            this.maxProp = maxProp;
            this.minDif = minDif;
        }
        get min() {
            return this.obj[ this.minProp ];
        }
        set min( v ) {
            this.obj[ this.minProp ] = v;
            this.obj[ this.maxProp ] = Math.max( this.obj[ this.maxProp ], v + this.minDif );
        }
        get max() {
            return this.obj[ this.maxProp ];
        }
        set max( v ) {
            this.obj[ this.maxProp ] = v;
            this.min = this.min; 
        }
    }

    function makeXYZGUI( gui, vector3, name, onChangeFn ) {
        const folder = gui.addFolder( name );
        folder.add( vector3, 'x', - 20, 20 ).onChange( onChangeFn );
        folder.add( vector3, 'y', 0, 20 ).onChange( onChangeFn );
        folder.add( vector3, 'z', - 20, 20 ).onChange( onChangeFn );
        folder.open();
    }

    function updateCamera() {
        camera.updateProjectionMatrix();
    }

    const gui = new GUI();

    const camFolder = gui.addFolder('Camera Frustum');
    camFolder.add( camera, 'fov', 1, 180 ).onChange( updateCamera );
    const minMaxGUIHelper = new MinMaxGUIHelper( camera, 'near', 'far', 0.1 );
    camFolder.add( minMaxGUIHelper, 'min', 0.00001, 50, 0.00001 ).name( 'near' ).onChange( updateCamera );
    camFolder.add( minMaxGUIHelper, 'max', 0.1, 50, 0.1 ).name( 'far' ).onChange( updateCamera );
    camFolder.open();

    const textureLoader = new THREE.TextureLoader();

    textureLoader.load(
        'club.jpg',
        ( texture ) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            texture.colorSpace = THREE.SRGBColorSpace;
            scene.background = texture; 
        } 
    );

    const planeSize = 40;
    const floorTexture = textureLoader.load( 'https://threejs.org/manual/examples/resources/images/checker.png' );
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.magFilter = THREE.NearestFilter;
    floorTexture.colorSpace = THREE.SRGBColorSpace;
    const repeats = planeSize / 2;
    floorTexture.repeat.set( repeats, repeats );

    const planeGeo = new THREE.PlaneGeometry( planeSize, planeSize );
    const planeMat = new THREE.MeshStandardMaterial( {
        map: floorTexture,
        side: THREE.DoubleSide,
    } );
    const floorMesh = new THREE.Mesh( planeGeo, planeMat );
    floorMesh.rotation.x = Math.PI * - .5;
    scene.add( floorMesh );

    const rectLight = new THREE.RectAreaLight( 0xFFFFFF, 1, 12, 4 );
    rectLight.position.set( 0, 10, 0 );
    rectLight.rotation.x = THREE.MathUtils.degToRad( - 90 );
    scene.add( rectLight );

    const rectHelper = new RectAreaLightHelper( rectLight );
    rectLight.add( rectHelper );

    const rectFolder = gui.addFolder('RectArea Light');
    rectFolder.addColor( new ColorGUIHelper( rectLight, 'color' ), 'value' ).name( 'color' );
    rectFolder.add( rectLight, 'intensity', 0, 1, 0.01 );
    rectFolder.add( rectLight, 'width', 0, 20 );
    rectFolder.add( rectLight, 'height', 0, 20 );
    rectFolder.add( new DegRadHelper( rectLight.rotation, 'x' ), 'value', - 180, 180 ).name( 'x rotation' );
    rectFolder.add( new DegRadHelper( rectLight.rotation, 'y' ), 'value', - 180, 180 ).name( 'y rotation' );
    rectFolder.add( new DegRadHelper( rectLight.rotation, 'z' ), 'value', - 180, 180 ).name( 'z rotation' );
    makeXYZGUI( rectFolder, rectLight.position, 'position' );

    const ambientLight = new THREE.AmbientLight( 0x000000, 0.3 );
    scene.add( ambientLight );

    const ambientFolder = gui.addFolder('Ambient Light');
    ambientFolder.addColor( new ColorGUIHelper( ambientLight, 'color' ), 'value' ).name( 'color' );
    ambientFolder.add( ambientLight, 'intensity', 0, 1, 0.01 );
    ambientFolder.open();

    const pointLight = new THREE.PointLight( 0xFFFFFF, 20, 50 );
    pointLight.position.set( -8, 6, -2 );
    scene.add( pointLight );

    const pointLightHelper = new THREE.PointLightHelper( pointLight, 0.5 );
    scene.add( pointLightHelper );

    const pointFolder = gui.addFolder('Point Light');
    pointFolder.addColor( new ColorGUIHelper( pointLight, 'color' ), 'value' ).name( 'color' );
    pointFolder.add( pointLight, 'intensity', 0, 20, 0.01 );
    pointFolder.add( pointLight, 'distance', 0, 100, 0.5 );
    
    const updatePointHelper = () => pointLightHelper.update();
    makeXYZGUI( pointFolder, pointLight.position, 'position', updatePointHelper );
    pointFolder.open();

    const cylinderGeo = new THREE.CylinderGeometry( 2, 2, 6, 32 );
    const cylinderTexture = textureLoader.load( 'wall.jpg' );
    cylinderTexture.colorSpace = THREE.SRGBColorSpace;
    
    const cylinderMat = new THREE.MeshStandardMaterial( { 
        map: cylinderTexture,
        roughness: 0.4
    } );
    const cylinderMesh = new THREE.Mesh( cylinderGeo, cylinderMat );
    cylinderMesh.position.set( 0, 0, -2 ); 
    scene.add( cylinderMesh );

    const sphereRadius = 3;
    const sphereGeo = new THREE.SphereGeometry( sphereRadius, 32, 16 );
    const sphereMat = new THREE.MeshStandardMaterial( { color: '#CA8' } );

    const numSpheres = 20;

    for ( let i = 0; i < numSpheres; ++ i ) {
        const loopSphereMat = new THREE.MeshStandardMaterial();
        loopSphereMat.color.setHSL( i * .73, 1, 0.5 );
        const mesh = new THREE.Mesh( sphereGeo, loopSphereMat );
        mesh.position.set(  sphereRadius + 20, sphereRadius - 2, i * sphereRadius * - 0.75 + 20);
        scene.add( mesh );
    }

    for ( let i = 0; i < numSpheres; ++ i ) {
        const loopSphereMat = new THREE.MeshStandardMaterial();
        loopSphereMat.color.setHSL( i * .73, 1, 0.5 );
        const mesh = new THREE.Mesh( sphereGeo, loopSphereMat );
        mesh.position.set(  sphereRadius - 20, sphereRadius - 2, i * sphereRadius * - 0.75 + 20);
        scene.add( mesh );
    }

    for ( let i = 0; i < numSpheres; ++ i ) {
        const loopSphereMat = new THREE.MeshStandardMaterial();
        loopSphereMat.color.setHSL( i * .73, 1, 0.5 );
        const mesh = new THREE.Mesh( sphereGeo, loopSphereMat );
        mesh.position.set( i * sphereRadius - 25, sphereRadius - 2, sphereRadius * - 0.75 + 20);
        scene.add( mesh );
    }

    for ( let i = 0; i < numSpheres; ++ i ) {
        const loopSphereMat = new THREE.MeshStandardMaterial();
        loopSphereMat.color.setHSL( i * .73, 1, 0.5 );
        const mesh = new THREE.Mesh( sphereGeo, loopSphereMat );
        mesh.position.set( i * sphereRadius - 25, sphereRadius - 2, sphereRadius * - 0.75 - 20);
        scene.add( mesh );
    }

    const animGeometry = new THREE.BoxGeometry( 1, 1, 1 );
    function makeInstance( geometry, color, x , z)  {
        const material = new THREE.MeshStandardMaterial( { color } );
        const cube = new THREE.Mesh( geometry, material );
        scene.add( cube );
        cube.position.set(x, 1, z); 
        return cube;
    }

    const animatedCubes = [
        makeInstance( animGeometry, 0x44aa88, 0, 3),
        makeInstance( animGeometry, 0x8844aa, - 5, - 2),
        makeInstance( animGeometry, 0xaa8844, 5, - 2 ),
        makeInstance( animGeometry, 0xaa4844, 0, - 7 ),
    ];

    let squidModel; 
    const gltfLoader = new GLTFLoader();
    

    gltfLoader.load(
        'squid.glb',
        (gltf) => {
            const root = gltf.scene;

            root.traverse((child) => {
                if (child.isMesh) {
                    if (child.material) {
                        child.material.roughness = 0.6;
                        child.material.metalness = 0.1;
                        child.material.side = THREE.DoubleSide;
                    }
                }
            });

            root.scale.set(2, 2, 2);
            root.position.set(0, 3, -2);

            squidModel = root;

            scene.add(root);
        },
    );

    function resizeRendererToDisplaySize( renderer ) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if ( needResize ) {
            renderer.setSize( width, height, false );
        }
        return needResize;
    }

    const roygbivColors = [
        0xFF0000, 
        0xFF7F00,
        0xFFFF00,
        0x00FF00, 
        0x0000FF, 
        0x4B0082, 
        0x9400D3 
    ];

    let lastColorChangeTime = 0;

    function render( time ) {
        time *= 0.001;

        if ( resizeRendererToDisplaySize( renderer ) ) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        if ( time - lastColorChangeTime >= 1.0 ) {
            const randomColor = roygbivColors[ Math.floor( Math.random() * roygbivColors.length ) ];
            planeMat.color.setHex( randomColor );
            lastColorChangeTime = time;
        }

        if ( squidModel ) {
            squidModel.rotation.y = time * 0.5; 
        }

        const rectRadius = 8;
        const rectSpeed = 0.8;
        rectLight.position.x = Math.cos( time * rectSpeed ) * rectRadius;
        rectLight.position.z = Math.sin( time * rectSpeed ) * rectRadius;
        rectLight.position.y = 10; 
        
        const pointSpeed = 1.2;
        pointLight.position.x = Math.sin( time * pointSpeed ) * 12;
        pointLight.position.z = Math.sin( time * pointSpeed * 2 ) * 6;
        pointLight.position.y = 5 + Math.cos( time * 2 ) * 2; 

        pointLightHelper.update();

        animatedCubes.forEach( ( cube, ndx ) => {
            const speed = 1 + ndx * .1;
            const rot = time * speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;
        } );

        renderer.render( scene, camera );
        requestAnimationFrame( render );
    }

    requestAnimationFrame( render );
}

main();