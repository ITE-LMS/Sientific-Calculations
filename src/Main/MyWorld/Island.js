import Main from "../Main";
import * as THREE from 'three'

export default class Island {
    constructor(){
        this.main = new Main();
        this.debug = this.main.debug;
        this.scene = this.main.scene;
        this.resource = this.main.resources.items.island;
        

        this.set_island();
    }

    set_island(){
        this.model = this.resource.scene;
        this.model.position.set(10000 , -50 , -10000);
        this.model.rotation.y = -200,
        this.model.scale.set(200 , 200 , 200);
        this.scene.add(this.model);
        let boundingBox = new THREE.Box3();

        this.model.traverse((child) =>
        {
            if(child instanceof THREE.Mesh)
            {
                child.castShadow = true
                boundingBox.expandByObject(child);
            }
        });

        let size = boundingBox.getSize(new THREE.Vector3());

        console.log('Model size (width, height, depth):', size.x, size.y, size.z);
    }
}