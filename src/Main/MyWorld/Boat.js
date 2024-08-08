import * as THREE from "three";
import Main from "../Main";

export default class Boat_Class {
  constructor() {
    this.main = new Main();
    this.camera = this.main.camera;
    this.debug = this.main.debug;
    this.resources = this.main.resources;
    this.scene = this.main.scene;
    this.resource = this.resources.items.speed_boat;
    this.deltaTime = this.main.time.delta;
    this.time = this.main.time;
    this.cameraOffset = new THREE.Vector3(0, 500, 800);

    //? boolean for movement :
    this.is_forward = false;
    this.is_back = false;
    this.is_stop = true;
    this.is_right = false;
    this.is_left = false;

    // Physics Variables set :
    this.vector_position = new THREE.Vector3(0, 75, 0);
    this.vector_velocity = new THREE.Vector3(0, 0, 1);
    this.vector_acceleration = new THREE.Vector3(0, 0, 0);

    // Axis :
    this.angular_velocity = new THREE.Vector3();
    this.right_axis = new THREE.Vector3(100, 0, 0);
    this.left_axis = new THREE.Vector3(-500, 0, 0);

    //! CONSTANT variables FOR LINEAR MOTION:
    //? Resistance :
    this.Drag_Coefficient = 0.35;

    //? Air resistance :
    this.Air_Density = 1.225;
    this.air_velocity = 5.14;
    this.Frontal_air_Area = 16.7573;

    //? Water resistance :
    this.Water_Density = 1000;
    this.Frontal_water_Area = 1.1137;

    //? Thrust power :
    this.water_outer_space_radius = 1;
    this.water_outer_space =
      Math.PI * Math.pow(this.water_outer_space_radius, 2);
    this.engine_force = 0;

    this.jet_boat = {
      mass: 2306, // in kg
      length: 8, // in meters
      width: 2.5, // in meters
      gravity: 9.81,
      density_of_water: 1000,
      volume: 2.306,
      velocity: new THREE.Vector3(0, 0, 0),
      position: new THREE.Vector3(0, 75, 0),
    };

    //! CONSTANT variables FOR ROTATIONAL MOTION:
    this.distanceFromCenter = 10000;
    this.angle = 180;
    this.moment_of_inertia =
      (1 / 12) *
      this.jet_boat.mass *
      (Math.pow(this.jet_boat.length, 2) + Math.pow(this.jet_boat.width, 2));
    this.angular_acceleration = new THREE.Vector3();

    this.set_boat_model();

    if (this.debug.active) {
      this.Boat = this.debug.ui.addFolder("BOAT");
      this.Boat.add(this.jet_boat, "mass", 0, 50000, 1).name("Mass");
      this.Boat.add(this.jet_boat, "volume", 0, 50, 1).name("Buoyancy");
      this.Boat.add(this, "engine_force", 0, 5000, 1).name("speed");
      this.Boat.close();
    }

    // code :
    this.steeringForce = 5; // Adjust as necessary
    this.heading = 0;
    this.steeringSpeed = 0.02;
    this.moveSpeed = 0.2;

    document.addEventListener("keydown", this.onKeyDown.bind(this), false);
    document.addEventListener("keyup", this.onKeyUp.bind(this), false);
  }

  set_boat_model() {
    this.model = this.resource.scene;
    this.model.position.y = 75;
    this.model.rotation.set(0, -Math.PI / 2, 0);
    this.model.scale.set(200, 200, 200);
    this.scene.add(this.model);

    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
      }
    });
  }

  set_weight_and_Buoyancy_forces() {
    if (this.model) {
      this.weightForce = this.jet_boat.mass * this.jet_boat.gravity;

      this.buoyancy =
        this.jet_boat.density_of_water *
        this.jet_boat.volume *
        this.jet_boat.gravity;

      if (this.buoyancy < this.weightForce) {
        this.acceleration = (this.weightForce / this.jet_boat.mass) * 0.1;
        this.jet_boat.velocity.y -= this.acceleration;
        this.jet_boat.position.add(
          this.jet_boat.velocity
            .clone()
            .multiplyScalar(this.jet_boat.mass / 100000000)
        );

        this.model.position.copy(this.jet_boat.position);
        if (this.model.rotation.z > -0.8 && this.is_stop) {
          this.model.rotation.y -= 0.001;
          this.model.rotation.z -= 0.001;
        }
      } else if (this.buoyancy >= this.weightForce) {
        if (this.model.rotation.z <= 0 && this.is_stop) {
          this.model.rotation.y += 0.001;
          this.model.rotation.z += 0.001;
        }
        if (this.model.position.y < 75) {
          this.acceleration = this.weightForce / this.jet_boat.mass;
          this.jet_boat.velocity.y += this.acceleration * 1.5;
          this.jet_boat.position.add(
            this.jet_boat.velocity
              .clone()
              .multiplyScalar(this.jet_boat.mass / 100000000)
          );

          this.model.position.copy(this.jet_boat.position);
        } else {
          this.model.position.y = 75;
          this.jet_boat.velocity = new THREE.Vector3(0, 0, 0);
          this.jet_boat.position.copy(this.vector_position);
        }
      }
    }
  }

  totalForcesLinear() {
    var sigmaF = new THREE.Vector3();

    var air = this.air_resistance_force();
    var water = this.water_resistance_force();
    var thrust = this.thrusting_force();

    sigmaF.x = air.x + water.x + thrust.x;
    sigmaF.y = air.y + water.y + thrust.y;
    sigmaF.z = air.z + thrust.z;

    return sigmaF;
  }

  air_resistance_force() {
    var air_resistance =
      0.5 *
      this.Air_Density *
      Math.pow(this.vector_velocity.length(), 2) *
      this.Drag_Coefficient *
      this.Frontal_air_Area;
    var F = new THREE.Vector3(0, 0, air_resistance);
    return F;
  }

  water_resistance_force() {
    var water_resistance =
      0.5 *
      this.Water_Density *
      Math.pow(this.vector_velocity.length(), 2) *
      this.Drag_Coefficient *
      this.Frontal_water_Area;
    var F = new THREE.Vector3(0, 0, water_resistance);
    return F;
  }

  thrusting_force() {
    if (!this.debug.active) {
      for (var i = 0; i < 5000; i++) {
        var thrusting_force =
          this.Water_Density * this.water_outer_space * (this.engine_force + i);
      }
    } else {
      var thrusting_force =
        this.Water_Density * this.water_outer_space * this.engine_force;
    }
    var thrust = -thrusting_force * 0.01;
    var F = new THREE.Vector3(0, 0, thrust);
    return F;
  }

  onKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 87) {
      // W
      this.is_stop = false;
      this.is_forward = true;
      this.is_back = false;
      this.is_right = false;
      this.is_left = false;
    }
    if (keyCode == 83) {
      // S
      this.is_stop = false;
      this.is_forward = false;
      this.is_back = true;
      this.is_right = false;
      this.is_left = false;
    }
    if (keyCode == 82) {
      // R
      this.is_stop = true;
      this.is_right = false;
      this.is_forward = false;
      this.is_back = false;
      this.is_left = false;
    }
    if (keyCode == 68) {
      // D
      this.is_right = true;
      this.is_stop = false;
      this.is_left = false;
    }
    if (keyCode == 65) {
      // A
      this.is_left = true;
      this.is_stop = false;
      this.is_right = false;
    }
  }

  onKeyUp(event) {
    var keyCode = event.which;
    if (keyCode == 87 || keyCode == 83 || keyCode == 68 || keyCode == 65) {
      this.angular_acceleration = new THREE.Vector3();
      this.angular_velocity = new THREE.Vector3();
      console.log(this.engine_force)
      // تخامد الحركة :
      // for (let i = 5000; i > 0; i++) 
      //   {

      //   }
      console.log("hereee");
      this.is_stop = true;
      this.is_forward = false;
      this.is_back = false;
      this.is_right = false;
      this.is_left = false;
    }
  }

  applySteeringTorque(steeringForce) {
    let steeringTorque = new THREE.Vector3();

    steeringTorque.y = steeringForce;

    // Calculate angular acceleration
    this.angular_acceleration = steeringTorque.divideScalar(
      this.moment_of_inertia
    );

    // Update angular velocity
    this.angular_velocity.add(
      this.angular_acceleration.multiplyScalar(this.deltaTime * 0.08)
    );

    // Apply damping to angular velocity
    this.angular_velocity.multiplyScalar(0.98); // Damping factor

    // Update heading
    this.heading += this.angular_velocity.y * this.deltaTime;
    this.model.rotation.y += this.angular_velocity.y * this.deltaTime;
  }

  move_forward() {
    var SigmaF = this.totalForcesLinear();

    this.vector_acceleration = SigmaF.divideScalar(this.jet_boat.mass);

    this.vector_velocity = this.vector_velocity.add(
      this.vector_acceleration.multiplyScalar(this.deltaTime * -0.1)
    );

    let forwardMovement = new THREE.Vector3(
      Math.sin(this.heading) * this.vector_velocity.length(),
      0,
      Math.cos(this.heading) * this.vector_velocity.length()
    );

    this.vector_position = this.vector_position.add(
      forwardMovement.multiplyScalar(this.deltaTime * -0.1)
    );
    this.model.position.copy(this.vector_position);
  }

  move_backward() {
    var SigmaF = this.totalForcesLinear();

    this.vector_acceleration = SigmaF.divideScalar(this.jet_boat.mass);

    this.vector_velocity = this.vector_velocity.add(
      this.vector_acceleration.multiplyScalar(this.deltaTime * -0.01)
    );

    let forwardMovement = new THREE.Vector3(
      Math.sin(this.heading) * this.vector_velocity.length(),
      0,
      Math.cos(this.heading) * this.vector_velocity.length()
    );

    this.vector_position = this.vector_position.add(
      forwardMovement.multiplyScalar(-this.deltaTime * -0.1)
    );
    this.model.position.copy(this.vector_position);
  }

  update() {
    if (!this.is_stop) {
      if (this.is_forward) {
        this.move_forward();
        if (this.is_right) {
          this.applySteeringTorque(-this.steeringForce);
        }
        if (this.is_left) {
          this.applySteeringTorque(this.steeringForce);
        }
      }
      if (this.is_back) {
        this.move_backward();
      }
      if (this.is_right) {
        this.move_forward();
        this.applySteeringTorque(-this.steeringForce);
      }
      if (this.is_left) {
        this.move_forward();
        this.applySteeringTorque(this.steeringForce);
      }
    }

    //this.model.rotation.y = -this.heading;
    this.set_weight_and_Buoyancy_forces();
  }
}
