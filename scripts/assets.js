let _Type = {
    "IMAGE": 0,
    "AUDIO": 1
}

const _imgdir = "../assets/images/";
const _audiodir = "../assets/audio/";

class Asset {
    constructor(id, filename, type) {
        this.id = id;
        switch (type) {
            case _Type.IMAGE:
                this.src = _imgdir + filename;
                break;
            case _Type.AUDIO:
                this.src = _audiodir + filename;
                break;
            default:
                console.error("INVALID ASSET TYPE!!!!!");
                break;
        }
    }
}



let assetslist = [
    new Asset("image_ball", "ball.png", Type.IMAGE),
    new Asset("image_paddle", "paddleorange.png", Type.IMAGE)
]
let assets = new createjs.LoadQueue();
queue.installPlugin(createjs.Sound);
queue.on("complete", handlecomplete, this);
queue.loadFile