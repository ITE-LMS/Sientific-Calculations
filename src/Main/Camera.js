import Main from "./Main";
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
export default class Camera
{
    constructor()
    {
        this.main = new Main()
        this.renderer = this.main.renderer
        this.sizes = this.main.sizes
        this.scene = this.main.scene
        this.canvas = this.main.canvas

        this.setInstance()
        this.setOrbitControls()
        
    }


    setInstance()
    {
        this.object = new THREE.PerspectiveCamera(
            75,
            this.sizes.width / this.sizes.height,
            1,
            200000
        )
        this.object.position.set(0, 3000, 3000);
        this.object.lookAt(new THREE.Vector3(0 , 0 , -500)); 
        this.scene.add(this.object)  
    }

    setOrbitControls()
    {
        this.controls = new OrbitControls(this.object, this.canvas)
        this.controls.enableDamping = true
        this.controls.maxPolarAngle = Math.PI *0.49;
        // this.controls.minDistance = 1.0;
        // this.controls.maxDistance = 5.0;
        //this.controls.target.set(0.5 , 0.5 , 0.5);
        this.axis = new THREE.AxesHelper(700)
        this.axis.setColors(0x0000ff, 0x00ff00, 0xff0000)
        this.scene.add(this.axis)
    }

    resize()
    {
        this.object.aspect = this.sizes.width / this.sizes.height
        this.object.updateProjectionMatrix()
    }

    update()
    {
        this.controls.update()
    }
}