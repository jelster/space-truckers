class Planet extends OrbitingGameObject {
    planetData;
    diameter;
    get name() { return this.planetData?.name; }

    constructor(scene, planData) {
        super(scene, planData);
        this.planetData = planData;

        let planet = this.mesh = MeshBuilder.CreateSphere(planData.name,
            { diameter: planData.scale },
            this.scene);

        this.diameter = planData.scale;

        planet.rotation.x = Math.PI;
        let planetMat = new BABYLON.PBRMaterial(planData.name + "-mat", this.scene);
        planetMat.roughness = 0.988;
        planetMat.metallic = 0.001;

        if (planData.diffuseTexture) {
            planetMat.albedoTexture = new Texture(planData.diffuseTexture, this.scene);
        }
        else {
            planetMat.albedoColor = planData.color ?? Color3.White();
        }
        if (planData.normalTexture) {
            planetMat.bumpTexture = new Texture(planData.normalTexture, this.scene);
        }
        if (planData.specularTexture) {
            planetMat.reflectivityTexture = new Texture(planData.specularTexture, this.scene);
        }
        else {
            planetMat.specularColor = new Color3(25 / 255, 25 / 255, 25 / 255);
        }
        if (planData.lightMapUrl) {
            planetMat.lightmapTexture = new Texture(planData.lightMapUrl, this.scene);
        }
        planetMat.directIntensity = planData.directIntensity ?? 1.0;
        planet.material = planetMat;
      //  this.update();
    }

    update(deltaTime) {
        this.rotation.y = Scalar.Repeat(this.rotation.y + 0.01, Scalar.TwoPi);
        super.update(deltaTime);
    }

}

export default Planet;