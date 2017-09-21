/* Logic/Logic.js
 * Created by Jiahonzheng
 */

/* Config of the game
 * Abbreviations in Config.skills:
 * power:Longer power-up
 * energy:Less energy consumption
 * faster:Move faster
 * attract:Attract energy dots
 * repulse:Repulse enemies
 * slow:Reduce game speed
 */
var Config = {
    width: 240,
    height: 120,
    max: 120 * 0.4,
    min: -120 * 0.4,
    dotSpace: 6,
    itemSpace: 20,
    speed: 0.11,
    acceleration: 0.0008 / 1000,
    radius: {Player: 6, Dot: 1, Power: 4, Enemy: 5, Coin: 6},
    skills: ["power", "energy", "faster", "attract", "repulse", "slow"],
    attract: {Dot: 1, Power: 0.1},
    repulse: {Enemy: 1},
    coinsScale: {"1": 0.70, "5": 0.80, "10": 0.90, "20": 0.95, "50": 1, "100": 1.1, "1000": 1.2, "10000": 1.3}
};
var DEBUG = 0;
var SoundNeeded = true;
var Sound = {};
Sound.Play = function (name) {
    if (!SoundNeeded) {
        document.getElementById(name).play();
    }
};
Sound.Stop = function (name) {
    if (SoundNeeded) {
        document.getElementById(name).pause();
    }
};

var Data = {
    key: 'data'
};
Data.Load = function () {
    DEBUG && console.log("Loading Profile");
    try {
        var data = localStorage.getItem(Data.key);
        DEBUG && console.log("Data:", data);
        if (data)
            return JSON.parse(data);
        else
            return {};
    } catch (err) {
        alert(err);
    }
    return {};
};
Data.Save = function (data) {
    DEBUG && console.log("Saving Profile");
    try {
        data = JSON.stringify(data);
        DEBUG && console.log("Data:", data);
        localStorage.setItem(Data.key, data);
    } catch (err) {
        alert(err);
    }
};

function Display(prefix, num) {
    if (prefix === '$') {
        num = num || 0;
    } else {
        num = num ? ((num / 10) | 0) : 0;
    }
    if (num < 10000) {
    } else if (num < 1000000) {
        num = (((num / 100) | 0) / 10) + 'k';
    } else {
        num = (((num / 10000) | 0) / 100) + 'M';
    }
    return prefix + num;
}

//Repository of dots
function DotsRepository() {
    var f_create, f_enter, f_discard, max = 127;
    var list = [];

    this.Create = function (create) {
        f_create = create;
        return this;
    };

    this.Enter = function (enter) {
        f_enter = enter;
        return this;
    };

    this.Discard = function (discard) {
        f_discard = discard;
        return this;
    };

    this.CheckOut = function () {
        var item;
        if (list.length)
            item = list.shift();
        else {
            item = f_create.apply(this);
        }

        return item;
    };

    this.CheckIn = function (item) {
        if (list.length < max) {
            f_enter && f_enter.call(this, item);
            list.push(item);
        } else {
            f_discard && f_discard.call(this, item);
        }
    };
}

function Randomize() {
    //Randomize
    this.Spacing = function (space) {
        var next = 0;

        /**
         * @return {boolean}
         */
        this.Test = function (t) {
            t = typeof t === 'number' ? t : 1;
            if (next === 0) {
                next = space();
                return false;
            }
            if ((next -= t) <= 0) {
                next = space();
                return true;
            }
            return false;
        };
        this.Reset = function () {
            next = 0;
        };
        return this;
    };

    this.options = [];

    this.Add = function (option, condition) {
        this.options.push({
            value: option,
            condition: condition
        });
    };

    this.Random = function () {
        var sum = 0, i;
        for (i = 0; i < this.options.length; i++) {
            sum += this.options[i].condition();
        }
        var rand = Math.random() * sum;
        var selected;
        for (i = 0; i < this.options.length; i++) {
            selected = this.options[i].value;
            if ((rand -= this.options[i].condition()) < 0)
                break;
        }
        return selected;
    };
}

function Game() {
    var game = this;

    game.data = Data.Load();

    var skills = game.data.skills || (game.data.skills = {}), i;
    for (i = 0; i < Config.skills.length; i++) {
        var name = Config.skills[i];
        skills[name] = skills[name] || 0;
    }

    var status = game.data.status = this.data.status || {};
    status.coins = status.coins || 0;
    status.currentDistance = status.currentDistance || 0;
    status.longestDistance = game.data.status.longestDistance || 0;

    var pointer = {};
    game.pointer = function (x, y) {
        pointer.x = x;
        pointer.y = y;
        pointer.fresh = true;
    };


    var dotsRepository = new DotsRepository().Create(function () {
        return new Dot();
    }).Enter(function (object) {
        object.onCheckIn();
    }).Discard(function (object) {
        object.UIRemove();
    });

    function Dot() {
        this.radius = Config.radius.Dot;
        this.attract = Config.attract.Dot;
        /**
         * @return {boolean}
         */
        this.Collide = function () {
            game.energy = Stage.Math.min(1.5, game.energy + 0.01);
            game.UIEnergy(game.energy);
            this.UIEat();
            return true;
        };
        this.Remove = function () {
            dotsRepository.CheckIn(this);
        };
        game.UINewDot(this);
    }

    function Power() {
        this.radius = Config.radius.Power;
        this.attract = Config.attract.Power;
        /**
         * @return {boolean}
         */
        this.Collide = function () {
            game.power = Stage.Math.max(game.player.power, game.power);
            game.UIPower(game.power);
            this.UIEat();
            return true;
        };
        this.Remove = function () {
            this.UIRemove();
        };
        game.UINewPower(this);
    }

    function Coin(value) {
        this.radius = Config.radius.Coin;
        this.value = value;
        this.scale = Config.coinsScale[value];
        /**
         * @return {boolean}
         */
        this.Collide = function () {
            game.coins += this.value;
            game.UICoins(game.coins);
            this.UIEat();
            return true;
        };
        this.Remove = function () {
            this.UIRemove();
        };
        game.UINewCoin(this);
    }

    function Enemy(name) {
        this.radius = Config.radius.Enemy;
        this.repulse = Config.repulse.Enemy;
        this.name = name;
        this.isDead = false;
        this.status = 1;
        /**
         * @return {boolean}
         */
        this.Collide = function () {
            if (!this.isDead) {
                if (this.status === 1) {
                    game.End(true);
                } else {
                    this.repulse = 0;
                    this.UIMode(-1);
                    this.vx = 0;
                    this.vy = 0;
                    this.isDead = true;

                    game.coins += 1000;
                    game.UICoins(game.coins);
                    this.UIEat();
                }
            }
            return false;
        };
        this.SetPower = function (power) {
            if (this.isDead) {
                return;
            }
            if (power <= 0) {
                if (this.status !== 1) {
                    this.repulse = Config.repulse.Enemy;
                    this.status = 1;
                    this.UIMode(1);
                }
            } else {
                if (this.status !== 0) {
                    this.repulse = 0;
                    this.status = 0;
                    this.UIMode(0);
                }
            }
        };
        this.Remove = function () {
            this.UIRemove();
        };
        game.UINewEnemy(this);
    }

    game.NewDot = function (x, y) {
        var dot = dotsRepository.CheckOut();
        dot.x = x;
        dot.y = y;
        dot.vx = 0;
        dot.vy = 0;
        dot.UIXY();
        inserted.push(dot);
        return dot;
    };
    game.NewPower = function (x, y) {
        var power = new Power();
        power.x = x;
        power.y = y;
        power.UIXY();
        inserted.push(power);
        return power;
    };
    game.NewCoin = function (value, x, y) {
        var coin = new Coin(value);
        coin.x = x;
        coin.y = y;
        coin.UIXY();
        inserted.push(coin);
        return coin;
    };
    game.NewEnemy = function (name, x, y, vx, vy) {
        var enemy = new Enemy(name);
        enemy.x = x;
        enemy.y = y;
        enemy.vx = vx || 0;
        enemy.vy = vy || 0;
        enemy.UIXY();
        enemy.UIMode(1);
        inserted.push(enemy);
        return enemy;
    };

    var objects = [];
    var inserted = [];
    var time = 0;
    game.player = null;
    game.speed = 0;
    game.coins = 0;
    game.power = 0;
    game.energy = 0;
    game.distance = 0;
    game.startDistance = 0;
    var lastDot = 0;
    var lastItem = 0;

    game.Tick = function (t) {
        t = Stage.Math.min(t, 100);

        var object;
        for (i = inserted.length - 1; i >= 0; i--) {
            object = inserted[i];
            if (object.x + object.radius < game.distance + Config.width) {
                inserted.splice(i, 1);
                object.UIEnter();
                objects.push(object);
            }
        }

        //When speed == 0,it is end of run.
        if (game.speed <= 0) {
            return;
        }

        var dist, px, py, dx, dy, dxy;
        dist = t * game.speed;

        time += t;
        game.distance += dist;
        game.UIDistance(game.distance);
        game.speed = Config.speed + game.distance * Config.acceleration * game.player.slow;
        game.energy -= dist * game.player.energy * 0.8;
        if (game.power <= 0) {
            game.power = 0;
        } else {
            game.power -= dist;
        }
        game.UIEnergy(game.energy);
        game.UIPower(game.power);

        px = game.player.x;
        py = game.player.y;

        var force, r;
        //
        for (i = objects.length - 1; i >= 0 && game.speed > 0; i--) {
            object = objects[i];

            //Missed Objects
            if (object.x - object.radius < game.distance) {
                object.Remove();
                objects.splice(i, 1);
                continue;
            }

            dx = object.x - px;
            dy = object.y - py;
            dxy = Stage.Math.length(dx, dy);

            //Attract The Energy Dots
            if (game.player.attract && object.attract) {
                force = game.player.attract * object.attract * 2000 / dxy / dxy / dxy;
                r = Stage.Math.min(1, force * t / 1000);
                object.x -= dx * r;
                object.y -= dy * r;
            }

            //Repulse The Enemies
            if (game.player.repulse && object.repulse) {
                force = game.player.repulse * object.repulse;
                force = force * 0.3 / (1 + Stage.Math.pow(1.1, (dxy - 10 * (force + 1))));
                r = Stage.Math.min(1, force * t / 1000);
                object.x += dx * r;
                object.y += dy * r;
            }


            dx = object.x - px;
            dy = object.y - py;
            dxy = Stage.Math.length(dx, dy);

            //Objects Have Been Destroyed Or Eaten
            if (dxy < object.radius + game.player.radius && object.Collide && object.Collide()) {
                object.Remove();
                objects.splice(i, 1);
                continue;
            }

            if (game.speed <= 0) {
                return;
            }

            if (object.SetPower) {
                object.SetPower(game.power);
            }

            if (object.vx) {
                object.x += object.vx * t;
            }
            if (object.vy) {
                object.y += object.vy * t;
            }

            object.UIXY();
        }

        if (game.energy > 0) {
            if (pointer.fresh) {
                dx = pointer.x - px;
                dy = pointer.y - py;
                dxy = Stage.Math.length(dx, dy);
                if (dxy < 0.1)
                    pointer.fresh = false;

                dxy = Stage.Math.max(1, dxy / (game.player.speed * t));
                px += dx / dxy;
                py += dy / dxy;
            }
            pointer.x += dist;
            px += dist;

            game.player.x = px;
            game.player.y = py;
            game.player.UIXY();
        } else if (px < game.distance - Config.width / 2) {
            game.End(false);
        }

        while (lastDot + Config.dotSpace <= game.distance) {
            lastDot += Config.dotSpace;
            if (object = randomDot.Test() && randomDot.Random()) {
                var added = object(lastDot + Config.width);
                added *= (1 + this.distance * 0.00002 * Stage.Math.random(0.8, 1.25));
                randomDot.Test(-added);
            }
        }

        while (lastItem + Config.itemSpace <= this.distance) {
            lastItem += Config.itemSpace;
            if (object = randomCoin.Test() && randomCoin.Random() || randomEnemy.Test() && randomEnemy.Random() || randomPower.Test() && randomPower.Random()) {
                object(lastItem + Config.width, Stage.Math.random(Config.min, Config.max));
            }
        }

        game.UIMove(game.distance, time, dist);
    };

    var randomCoin = new Randomize().Spacing(function () {
        return Stage.Math.random(20, 100) / Config.itemSpace * 10;
    });
    randomCoin.Add(function (x, y) {
        return game.NewCoin(1, x, y);
    }, function () {
        return 1;
    });
    randomCoin.Add(function (x, y) {
        return game.NewCoin(5, x, y);
    }, function () {
        return game.distance > 2000 ? 2 : 0;
    });
    randomCoin.Add(function (x, y) {
        return game.NewCoin(10, x, y);
    }, function () {
        return game.distance > 5000 ? 4 : 0;
    });
    randomCoin.Add(function (x, y) {
        return game.NewCoin(50, x, y);
    }, function () {
        return game.distance > 10000 ? 8 : 0;
    });
    randomCoin.Add(function (x, y) {
        return game.NewCoin(100, x, y);
    }, function () {
        return game.distance > 20000 ? 32 : 0;
    });
    randomCoin.Add(function (x, y) {
        return game.NewCoin(1000, x, y);
    }, function () {
        return game.distance > 50000 ? 4 * game.distance / 100000 : 0;
    });
    randomCoin.Add(function (x, y) {
        return game.NewCoin(10000, x, y);
    }, function () {
        return game.distance > 50000 ? game.distance / 100000 : 0;
    });

    var randomPower = new Randomize().Spacing(function () {
        return Stage.Math.random(100, 400);
    });
    randomPower.Add(function (x, y) {
        return game.NewPower(x, y);
    }, function () {
        return 5;
    });

    var randomEnemy = new Randomize().Spacing(function () {
        return Stage.Math.random(10, 50) / Config.itemSpace * 10;
    });
    randomEnemy.Add(function (x) {
        var y = Stage.Math.random(-1, 1) * (Config.height / 2 - 10);
        return game.NewEnemy('box', x, y);
    }, function () {
        return 1;
    });
    randomEnemy.Add(function (x) {
        var d = Stage.Math.random() >= 0.5 ? 1 : -1;
        var y = d * Config.height / 2;
        var vy = -d * game.speed * Stage.Math.random(0.5, 2);
        return game.NewEnemy('tri', x + 400 * game.speed, y - 400 * vy, 0, vy);
    }, function () {
        return 2;
    });

    var randomDot = new Randomize().Spacing(function () {
        return 1;
    });
    randomDot.Range = function (min, max) {
        var span = Stage.Math.random(min, max) * (Config.max - Config.min);
        var middleSpan = Stage.Math.random(Config.min + span / 2, Config.max - span / 2);
        span *= (Stage.Math.random() >= 0.5 ? 1 : -1);
        var lowerBound = middleSpan - span / 2;
        var upperBound = middleSpan + span / 2;
        return {
            lowerBound: lowerBound,
            upperBound: upperBound,
            span: span
        };
    };
    randomDot.Add(function (x) { //Straight
        var n = Stage.Math.random(40, 50);
        var y = Stage.Math.random(-Config.height * 0.5, Config.height * 0.5);
        var added = 0;
        for (var i = 0; i < n; i++) {
            added++;
            game.NewDot(x + i * Config.dotSpace, y);
        }
        return added;
    }, function () {
        return 1;
    });
    randomDot.Add(function (x) { //Ramp
        var n = Stage.Math.random(20, 40) | 0;
        var range = randomDot.Range(0.2, 0.7);
        var added = 0;
        for (var i = 0; i < n; i++) {
            added++;
            game.NewDot(x + i * Config.dotSpace, range.lowerBound + i * range.span / n);
        }
        return added;
    }, function () {
        return game.distance < 1000 ? 0 : 1;
    });
    randomDot.Add(function (x) { //Stairs
        var unitsNum = Stage.Math.random(3, 6) | 0;
        var unitTread = Stage.Math.random(5, 15) | 0;
        var n = unitsNum * unitTread;
        var range = randomDot.Range(0.2, 0.7);
        var unitRise = range.span / unitsNum;
        var added = 0;
        for (var i = 0; i < n; i++) {
            added++;
            game.NewDot(x + i * Config.dotSpace, range.lowerBound + ((i * range.span / n) / unitRise | 0) * unitRise);
        }
        return added;
    }, function () {
        return game.distance < 5000 ? 0 : 1;
    });
    randomDot.Add(function (x) { //Serrations
        var unitsNum = Stage.Math.random(3, 6) | 0;
        var unitLength = Stage.Math.random(7, 13) | 0;
        var n = unitsNum * unitLength;
        var range = randomDot.Range(0.2, 0.7);
        var unitRise = range.span;
        var added = 0;
        for (var i = 0; i < n; i++) {
            added++;
            game.NewDot(x + i * Config.dotSpace, range.lowerBound + ((-i * range.span / unitLength) / unitRise | 0) * unitRise + i * range.span / unitLength);
        }
        return added;
    }, function () {
        return game.distance < 20000 ? 0 : 1;
    });
    randomDot.Add(function (x) { //Sine Wave
        var n = Stage.Math.random(40, 60);
        var resolution = Config.dotSpace / Stage.Math.random(10, 30);
        var amplitude = Stage.Math.random(10, 30);
        var y = Stage.Math.random(Config.min + amplitude, Config.max - amplitude);
        var added = 0;
        for (var i = 0; i < n; i++) {
            added++;
            game.NewDot(x + i * Config.dotSpace, y + amplitude * Stage.Math.sin(resolution * i));
        }
        return added;
    }, function () {
        return game.distance < 10000 ? 0 : 2;
    });
    randomDot.Add(function (x) { //Sine Wave XY
        var n = Stage.Math.random(40, 60);
        var resolution_1 = Config.dotSpace / Stage.Math.random(10, 40);
        var amplitude_1 = Stage.Math.random(10, 30);
        var resolution_2 = Config.dotSpace / Stage.Math.random(10, 40);
        var amplitude_2 = Stage.Math.random(10, 30);
        var y = Stage.Math.random(Config.min + amplitude_1, Config.max - amplitude_1);
        var added = 0;
        for (var i = 0; i < n; i++) {
            added++;
            game.NewDot(x + i * Config.dotSpace + amplitude_2 * Stage.Math.cos(resolution_2 * i), y + amplitude_1 * Stage.Math.sin(resolution_1 * i));
        }
        return added;
    }, function () {
        return game.distance < 25000 ? 0 : game.distance < 15000 ? 1 : 2;
    });
    randomDot.Add(function (x) { //Zigzag
        var n = Stage.Math.random(40, 60);
        var resolution = Config.dotSpace / Stage.Math.random(10, 40);
        var amplitude = Stage.Math.random(20, 50);
        var y = Stage.Math.random(Config.min + amplitude, Config.max - amplitude);
        var added = 0;
        var temp;
        for (var i = 0; i < n; i++) {
            added++;
            temp = i * resolution;
            temp = Stage.Math.rotate(temp, -Stage.Math.PI, Stage.Math.PI) / Stage.Math.PI * 2;
            if (temp > 1)
                temp = 2 - temp;
            else if (temp < -1) {
                temp = -2 - temp;
            }
            game.NewDot(x + i * Config.dotSpace, y + amplitude * temp);
        }
        return added;
    }, function () {
        return game.distance < 15000 ? 0 : 2;
    });
    randomDot.Add(function (x) { //Rectangle
        var n = Stage.Math.random(3, 8);
        var y = Stage.Math.random(Config.min, Config.max - n * Config.dotSpace);
        var added = 0;
        for (var i = 0; i < n; i++) {
            for (var j = 0; j < n; j++) {
                added++;
                game.NewDot(x + i * Config.dotSpace, y + j * Config.dotSpace);
            }
        }
        return added;
    }, function () {
        return game.distance < 70000 ? 0 : 1;
    });

    randomDot.Add(function (x) { //Spray
        var n = Stage.Math.random(40, 60);
        var max = Stage.Math.min(1, game.distance / 100000);
        var min = Stage.Math.min(1, game.distance / 200000);
        var range = randomDot.Range(min * 0.5, max * 0.7);

        var added = 0;
        for (var i = 0; i < n; i++) {
            added++;
            game.NewDot(x + i * Config.dotSpace, Stage.Math.random(range.lowerBound, range.upperBound));
        }
        return added;

    }, function () {
        return game.distance < 50000 ? 0 : game.distance < 75000 ? 1 : 2;
    });

    randomDot.Add(function (x) {
        var n = Stage.Math.random(40, 60);
        var f = Stage.Math.random(0.2, 0.9) * Stage.Math.PI;
        var c = 5;

        var added = 0;
        for (var i = 0; i < n; i++) {
            added++;
            game.NewDot(x + c * Stage.Math.sqrt(i + 1) * Stage.Math.sin(i * f), c * Stage.Math.sqrt(i + 1) * Stage.Math.cos(i * f));
        }
        return added;

    }, function () {
        return game.distance < 100000 ? 0 : 1;
    });

    function Player() {
        this.radius = Config.radius.Player;
        this.Attributions = function (skills) {
            this.power = 500 + skills.power * 250;
            this.energy = 0.0008 * (1 - skills.energy / 8);
            this.speed = 0.2 + skills.faster * 0.02;
            this.attract = skills.attract;
            this.repulse = skills.repulse;
            this.slow = 1 / (skills.slow * 0.2 + 1);
        };
        game.UINewPlayer(this);
    }

    /**
     * @return {number}
     */
    game.UpgradePrice = function (name) {
        var price = Stage.Math.pow(10, (skills[name] || 0) + 2);
        return price;
    };

    game.Upgrade = function (name) {
        var price = game.UpgradePrice(name);
        if (price > 0 && price <= status.coins && skills[name] < 6) {
            status.coins -= price;
            skills[name]++;
            Data.Save(game.data);
        }
        game.UIUpgrade();
    };

    game.Clear = function () {
        for (i = 0; i < objects.length; i++)
            objects[i].Remove();
        objects.length = 0;

        for (i = 0; i < inserted.length; i++)
            inserted[i].Remove();
        inserted.length = 0;
    };

    game.Start = function () {
        DEBUG && console.log("GAME START");

        game.Clear();

        game.speed = Config.speed;
        game.power = 0;
        game.coins = 0;
        game.energy = 0.5;
        game.distance = game.startDistance || 0;
        time = 0;
        lastDot = game.distance;
        lastItem = game.distance;
        pointer = {
            x: Config.width / 5 + this.distance,
            y: 0
        };

        randomDot.Reset();
        randomPower.Reset();
        randomEnemy.Reset();
        randomCoin.Reset();

        game.UIEnergy(game.energy);
        game.UIPower(game.power);
        game.UICoins(game.coins);

        game.player = game.player || new Player();
        game.player.x = pointer.x;
        game.player.y = pointer.y;
        game.player.UIXY();
        game.player.Attributions(skills);
        game.player.UILive();
    };

    game.End = function (die) {
        DEBUG && console.log("Game End");
        if (game.speed <= 0) {
            return;
        }
        game.speed = 0;
        if (game.distance > status.longestDistance)
            status.longestDistance = game.distance | 0;
        status.currentDistance = game.distance | 0;
        status.coins += game.coins;

        Data.Save(game.data);

        game.player.UIDie(die, game.UIEnd.bind(game.ui));
    };

}

Stage(function (stage) {
    var game = new Game();

    var upgrades = {};

    stage.on('viewport', function (viewport) {
        this.pin({
            width: Config.width,
            height: Config.height * 1.2,
            scaleMode: 'in-pad',
            scaleWidth: viewport.width,
            scaleHeight: viewport.height,
            offSetY: 0
        });
    });

    function open(view) {
        if (typeof view === 'string')
            view = stage[view];
        if (open.view === view)
            return;
        if (open.view)
            open.view.trigger('close');
        open.view = view.trigger('open');
    }

    function StoreRefresh() {
        game.StoreCoinsDisplay();
        for (var i = 0; i < Config.skills.length; i++) {
            var name = Config.skills[i];
            var price = game.UpgradePrice(name);
            var level = game.data.skills[name] || 0;
            var button = upgrades[name].empty().pin('alpha', 0.9);
            //Stage.image('up_' + name).pin('align', 0.1).appendTo(button);

            Stage.image('skills_' + name).pin({
                alignX: 0.03,
                alignY: 0.2,
                scale: 1.5
            }).appendTo(button);

            if (level <= 5) {
                Stage.string('number').value(Display('$', price)).pin({
                    alignX: 1,
                    alignY: 0.5,
                    offsetX: -1.6,
                    alpha: 0.8,
                    scale: 1.2
                }).appendTo(button);
            }
            if (level === 6) {
                Stage.image('godlike').pin({
                    alignX: 0.9,
                    alignY: 0.5,
                    scale: 1.5
                }).appendTo(button);
            }

            if (level <= 6) {
                Stage.string('level').pin({
                    alignX: 0,
                    alignY: 0.75,
                    offsetX: 1.6,
                    offsetY: 1.4,
                    scale: 1.2
                }).appendTo(button).value(level);
            }
            for (var child = button.first(); child; child = child.next()) {
                child.pin('alpha', (price <= game.data.status.coins && level !== 6) ? 1 : 0.5);
            }
        }
    }

    function HomeRefresh() {
        game.HomeScoresDisplay();
        game.HomeCoinsDisplay();
    }

    game.UIUpgrade = function () {
        StoreRefresh();
    };

    //Home Screen
    (function () {
        var home = stage.home = Stage.create().appendTo(stage).hide().pin('align', 0.5);
        var homeBG = Stage.image('background').appendTo(home).pin('align', 0.5);

        home.on('viewport', function () {
            this.pin({
                width: this.parent().pin('width'),
                height: this.parent().pin('height')
            });

            homeBG.pin({
                scaleMode: 'out',
                scaleWidth: this.pin('width'),
                scaleHeight: this.pin('height')
            });
        });
        home.on('open', function () {
            HomeRefresh();
            this.pin('alpha', 0).show().tween(200).pin('alpha', 1);
        });
        home.on('close', function () {
            this.tween(200).pin('alpha', 0).hide();
        });

        Stage.image('money').appendTo(home).pin({
            alignX: 0,
            alignY: 0,
            offsetX: 1,
            offsetY: 0
        });

        Stage.image('currentScores').appendTo(home).pin({
            alignX: 0.33,
            alignY: 0,
            offsetX: 0,
            offsetY: 0
        });

        Stage.image('bestScores').appendTo(home).pin({
            alignX: 0.66,
            alignY: 0,
            offsetX: 0,
            offsetY: 0
        });

        Stage.image('bgm').appendTo(home).pin({
            alignX: 1,
            alignY: 0,
            offsetX: 0,
            offsetY: 0
        });


        var coinsDisplay = Stage.string('number').appendTo(home).pin({
            alignX: 0,
            alignY: 0.05,
            offsetX: 0,
            offsetY: 0
        });
        var currentScoresDisplay = Stage.string('number').appendTo(home).pin({
            alignX: 0.33,
            alignY: 0.05,
            offsetX: 0,
            offsetY: 0
        });
        var bestScoresDisplay = Stage.string('number').appendTo(home).pin({
            alignX: 0.66,
            alignY: 0.05,
            offsetX: 0,
            offsetY: 0
        });
        var soundOn = Stage.image('on').appendTo(home).pin({
            alignX: 1,
            alignY: 0.05,
            offsetX: 0,
            offsetY: 0
        }).on('click', function () {
            game.HomeSoundControl();
        });
        var soundOff = Stage.image('off').appendTo(home).pin({
            alignX: 1,
            alignY: 0.05,
            offsetX: 0,
            offsetY: 0
        }).on('click', function () {
            game.HomeSoundControl();
        }).hide();


        var menu = Stage.column().appendTo(home).pin('align', 0.5).spacing(4);

        game.HomeCoinsDisplay = function () {
            coinsDisplay.value(Display('$', game.data.status.coins));
        };
        game.HomeScoresDisplay = function () {
            currentScoresDisplay.value(Display("", game.data.status.currentDistance));
            bestScoresDisplay.value(Display("", game.data.status.longestDistance));
        };
        game.HomeSoundControl = function () {
            if (SoundNeeded) {
                Sound.Stop("HomeBGM");
                soundOn.hide();
                soundOff.show();
            } else {
                Sound.Play("HomeBGM");
                soundOff.hide();
                soundOn.show();
            }
            SoundNeeded = !SoundNeeded;
        };

        Stage.image('start').appendTo(menu).pin('alignX', 0.5).on('click', function () {
            game.startDistance = 0;
            open('play');
        });
        Stage.image('timeMachine').appendTo(menu).pin('alignX', 0.5).on('click', function () {
            game.startDistance = game.data.status.longestDistance;
            open('play');
        });
        Stage.image('store').appendTo(menu).pin('alignX', 0.5).on('click', function () {
            open('store');
        });
        Stage.image('readMe').appendTo(menu).pin('alignX', 0.5).on('click', function () {
            open('readMe');
        });
    })();

    //Store Screen
    (function () {
        var store = stage.store = Stage.create().appendTo(stage).hide().pin('align', 0.5);
        var storeBG = Stage.image('background').appendTo(store).pin('align', 0.5);


        game.StoreCoinsDisplay = function () {
            coinsDisplay.value(Display('$', game.data.status.coins));
        };

        store.on('viewport', function () {
            this.pin({
                width: this.parent().pin('width'),
                height: this.parent().pin('height')
            });

            storeBG.pin({
                scaleMode: 'out',
                scaleWidth: this.pin('width'),
                scaleHeight: this.pin('height')
            });
        });
        store.on('open', function () {
            coinsDisplay.value(Display('$', game.data.status.coins));
            StoreRefresh();
            this.pin('alpha', 0).show().tween(200).pin('alpha', 1);
        });
        store.on('close', function () {
            this.tween(200).pin('alpha', 0).hide();
        });

        var menu = Stage.column().appendTo(store).pin('align', 0.5).spacing(3.5);

        var coinsDisplay = Stage.string('number').appendTo(menu).pin('alignX', 0.5);

        for (var i = 0; i < Config.skills.length; i++) {
            var name = Config.skills[i];
            upgrades[name] = Stage.image('selector').appendTo(menu).attr('name', name).pin('scale', 0.8).on('click', function () {
                game.Upgrade(this.attr('name'));
            });
        }

        Stage.image('back').appendTo(menu).pin('alignX', 0.5).on('click', function () {
            open('home');
        });

    })();


    //ReadMe Screen
    (function () {
        var readMe = stage.readMe = Stage.create().appendTo(stage).hide().pin('align', 0.5);
        var readMeBG = Stage.image('background').appendTo(readMe).pin('align', 0.5);
        readMe.on('viewport', function () {
            this.pin({
                width: this.parent().pin('width'),
                height: this.parent().pin('height')
            });

            readMeBG.pin({
                scaleMode: 'out',
                scaleWidth: this.pin('width'),
                scaleHeight: this.pin('height')
            });
        });
        readMe.on('open', function () {
            page_2.hide();
            page_1.show();
            this.pin('alpha', 0).show().tween(200).pin('alpha', 1);
        });
        readMe.on('close', function () {
            this.tween(200).pin('alpha', 0).hide();
        });

        var menu = Stage.column().appendTo(readMe).pin('align', 0.5).spacing(3.5);
        var page_1 = Stage.image('page_1').appendTo(menu).pin('alignX', 0.5).on('click', function () {
            page_1.hide();
            page_2.show()
        });
        var page_2 = Stage.image('page_2').appendTo(menu).pin('alignX', 0.5).on('click', function () {
            page_2.hide();
            page_1.show();
        }).hide();


        Stage.image('back').appendTo(menu).pin({
            alignX: 0.5
        }).on('click', function () {
            open('home');
        });

    })();


    //Play Screen
    (function () {
        var play = stage.play = Stage.create().appendTo(stage).hide().pin('align', 0.5).hide();

        var playbg = Stage.image('background').appendTo(play).pin('align', 0.5);
        
         var border = Stage.image('border').stretch().appendTo(play).pin({
         width: Config.width,
         height: Config.height,
         align: 0.5,
         alpha: 0.5
         });
        
        var field = Stage.create().appendTo(play).attr('spy', true).pin({
            width: Config.width,
            height: Config.height,
            alignX: 0.5,
            alignY: 0.5,
            handleY: 0
        });

        var uiEnergy = Stage.image('energy').stretch().appendTo(play).pin({
            alignX: 0,
            alignY: 0,
            offsetX: 3,
            offsetY: 2
        });

        var uiPower = Stage.image('energy').stretch().appendTo(play).pin({
            alignX: 0,
            alignY: 0,
            offsetX: 3,
            offsetY: 7
        });

        var uiDistance = Stage.string('number').appendTo(play).pin({
            alignX: 0.003,
            alignY: 0,
            offsetX: 3,
            offsetY: 11.5
        });

        var uiCoins = Stage.string('number').appendTo(play).pin({
            alignX: 1,
            alignY: 0,
            offsetX: -3,
            offsetY: 2
        });

        var lastItem = Stage.column(0.5).appendTo(play).pin({
            alignX: 0.5,
            alignY: 0,
            offsetX: 10,
            offsetY: 2
        }).append(Stage.image(), Stage.string('number').pin('scale', 0.8)).hide();
        var lastItemTimeout = null;

        function setLastItem(value, scale) {
            if (typeof value === "number") {
                lastItem.first().image('coin_' + value).pin('scale', scale || 1);
                //lastItem.last().value(CoinsDisplay(value)).visible(value > 100);
                lastItem.last().value(Display('$', value)).visible(value > 100);
            } else {
                lastItem.first().image(value).pin('scale', scale || 1);
            }
            lastItem.show();
            clearTimeout(lastItemTimeout);
            lastItemTimeout = setTimeout(function () {
                lastItem.hide();
            }, 1000);
        }

        var cursor = Stage.image('cursor').pin('handle', 0.5).appendTo(field).hide();

        play.on('viewport', function () {
            this.pin({
                width: this.parent().pin('width'),
                height: this.parent().pin('height')
            });

            playbg.pin({
                scaleMode: 'out',
                scaleWidth: this.pin('width'),
                scaleHeight: this.pin('height')
            });


        });

        play.on('open', function () {
            game.Start();
            this.pin('alpha', 0).show().tween(50).pin('alpha', 1);
        });

        play.tick(function (t) {
            game.Tick(t);
        }, true);


        field.on([Stage.Mouse.MOVE, Stage.Mouse.START], function (point) {
            game.pointer(point.x, point.y);
            cursor.offset(point).visible(true);
        });

        play.on('close', function () {
            game.End();
            this.tween(200).pin('alpha', 0).hide();
        });

        game.UIMove = function (distance, time, dist) {
            cursor.pin('offsetX', cursor.pin('offsetX') + dist);
            field.pin('offsetX', -distance);
        };

        game.UIDistance = function (distance) {
            uiDistance.value(Display("", distance));
        };

        game.UIEnergy = function (e) {
            uiEnergy.pin('width', (Stage.Math.max(0, e) * 100 | 0) / 100 * 40);
        };

        game.UIPower = function (e) {
            uiPower.pin('width', (e * 1000 | 0) / 2000000 * 80);
        };

        game.UICoins = function (num) {
            uiCoins.value(Display('$', num));
        };

        game.UIEnd = function () {
            DEBUG && console.log('Play UI End');
            setTimeout(function () {
                open('home');
            }, 50);
        };

        var dotsZone = Stage.create().appendTo(field);
        var othersZone = Stage.create().appendTo(field);
        var playerZone = Stage.create().appendTo(field);

        game.UINewDot = function (dot) {
            dot.ui = Stage.image('dot').pin('handle', 0.5).appendTo(dotsZone).hide();

            dot.UIEnter = function () {
                dot.ui.show();
            };

            dot.UIXY = function () {
                dot.ui.offset(this);
            };

            dot.onCheckIn = function () {
                dot.ui.hide();
            };

            dot.UIRemove = function () {
                dot.ui.remove();
                dot.ui = null;
            };

            dot.UIEat = function () {
            }
        };
        game.UINewPower = function (power) {
            power.ui = Stage.image('power').pin('handle', 0.5).appendTo(othersZone).hide();
            power.UIEnter = function () {
                this.ui.show();
            };
            power.UIXY = function () {
                this.ui.offset(this);
            };
            power.UIEat = function () {
                setLastItem("power", 1);
            };
            power.UIRemove = function () {
                this.ui.remove();
                this.ui = null;
            };
        };
        game.UINewCoin = function (coin) {
            coin.ui = Stage.image('coin_' + coin.value).pin('handle', 0.5).appendTo(othersZone).pin('scale', coin.scale).hide();

            coin.UIEnter = function () {
                coin.ui.show();
            };

            coin.UIXY = function () {
                coin.ui.offset(this);
            };

            coin.UIRemove = function () {
                coin.ui.remove();
                coin.ui = null;
            };

            coin.UIEat = function () {
                setLastItem(coin.value, coin.scale);
            };
        };
        game.UINewEnemy = function (enemy) {
            enemy.ui = Stage.anim(enemy.name + '_live').pin('handle', 0.5).appendTo(othersZone).hide();

            enemy.UIEnter = function () {
                this.ui.show();
            };

            enemy.UIXY = function () {
                this.ui.offset(this);
                if (this.vx || this.vy)
                    this.ui.pin('rotation', Stage.Math.atan2(this.vx, this.vy) - Stage.Math.PI / 2);
            };

            enemy.UIMode = function (status) {
                if (status === 1) {
                    this.ui.frames(this.name + '_live').play();
                }
                if (status === 0) {
                    this.ui.frames(this.name + '_weak').play();
                }
                if (status === -1) {
                    this.ui.frames(this.name + '_dead').gotoFrame(0).pin({
                        'alpha': 0.8,
                        'rotation': 0
                    });
                }
            };

            enemy.UIRemove = function () {
                this.ui.remove();
                this.ui = null;
            };

            enemy.UIEat = function () {
                setLastItem(1000, 1.1);
            };
        };
        game.UINewPlayer = function (player) {
            DEBUG && console.log('Create Player');
            player.ui = Stage.anim('player_live').pin('handle', 0.5).appendTo(playerZone);

            player.UIXY = function () {
                this.ui.offset(this);
            };

            player.UILive = function () {
                DEBUG && console.log('Player Live');
                this.ui.frames('player_live').show();
                this.ui.play();
            };

            player.UIDie = function (anim, callback) {
                DEBUG && console.log('Player Die');
                if (anim) {
                    cursor.hide();
                    this.ui.frames('player_die').play().repeat(1, callback);
                } else {
                    callback();
                }
            };
        };

    })();

    open('home');
});