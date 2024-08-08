import Boat from './Boat.js';
import Sky from './Sky.js';
import Environment from "./Environment.js";
import Water from './Water.js';
import Sky_Class from './Sky.js';
import Water_Class from './Water.js';
import Boat_Class from './Boat.js';
import WaterScene from './Water.js';
import Island from './Island.js';



export default class World
{
    constructor()
    {
        this.environment = new Environment();
        this.sky = new Sky_Class();
        this.boat = new Boat_Class();
        this.water = new Water_Class();
        this.island = new Island();
    }

    update()
    {
        this.water.update();
        this.boat.update();
    }
}