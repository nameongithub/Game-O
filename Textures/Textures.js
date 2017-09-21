/**
 * Created by Jiahon on 2017/6/4.
 */
Stage({
    image: {src: "./textures.png", ratio: 8},
    ppu: 16,
    textures: {
        "background": {x: 13, y: 0, width: 1, height: 1},
        "money":{x: 0, y: 5.2, width: 0.8, height: 0.625},
        "currentScores":{x: 1, y: 5.2, width: 1.7, height: 0.625},
        "bestScores":{x: 3, y: 5.2, width: 1.7, height: 0.625},
        "bgm":{x:0,y:6.2,width:1.1,height:0.625},
        "on":{x:1.5,y:6.2,width:0.5,height:0.625},
        "off":{x:2,y:6.2,width:0.5,height:0.625},

        "start": {x: 10, y: 1, width: 1.5, height: 0.9},
        "timeMachine": {x: 11.5, y: 1, width: 2, height: 0.9},
        "store": {x: 13.5, y: 1, width: 1.5, height: 0.9},
        "readMe":{x:14,y:2,width:2,height:1},

        "selector": {x: 7, y: 2, width: 4.52, height: 1},
        "back": {x: 14.5, y: 0, width: 1.5, height: 1},

        "coin_1": {x: 0, y: 0, width: 1, height: 1},
        "coin_5": {x: 1, y: 0, width: 1, height: 1},
        "coin_10": {x: 2, y: 0, width: 1, height: 1},
        "coin_20": {x: 3, y: 0, width: 1, height: 1},
        "coin_50": {x: 4, y: 0, width: 1, height: 1},
        "coin_100": {x: 5, y: 0, width: 1, height: 1},
        "coin_1000": {x: 6, y: 0, width: 1, height: 1},
        "coin_10000": {x: 7, y: 0, width: 1, height: 1},

        "tri_0": {x: 0, y: 3, width: 1, height: 1},
        "tri_1": {x: 1, y: 3, width: 1, height: 1},
        "tri_2": {x: 2, y: 3, width: 1, height: 1},
        "tri_3": {x: 3, y: 3, width: 1, height: 1},
        "tri_4": {x: 4, y: 3, width: 1, height: 1},
        "tri_5": {x: 5, y: 3, width: 1, height: 1},
        "tri_6": {x: 6, y: 3, width: 1, height: 1},
        "tri_7": {x: 7, y: 3, width: 1, height: 1},
        "tri_8": {x: 8, y: 3, width: 1, height: 1},
        "tri_9": {x: 9, y: 3, width: 1, height: 1},
        "tri_a": {x: 10, y: 3, width: 1, height: 1},
        "tri_b": {x: 11, y: 3, width: 1, height: 1},


        "tri_live": ["tri_0", "tri_1", "tri_2", "tri_3", "tri_4",
            "tri_4", "tri_3", "tri_2", "tri_1", "tri_0"],

        "tri_weak": ["tri_6", "tri_7", "tri_8", "tri_9", "tri_a", "tri_b"],

        "tri_mix": ["tri_1", "tri_0", "tri_0", "tri_1", "tri_2",
            "tri_6", "tri_7", "tri_8",
            "tri_3", "tri_4", "tri_4", "tri_3", "tri_2",
            "tri_9", "tri_a", "tri_b"],

        "tri_dead": ["tri_5"],

        "box_0": {x: 0, y: 4, width: 1, height: 1},
        "box_1": {x: 1, y: 4, width: 1, height: 1},
        "box_2": {x: 2, y: 4, width: 1, height: 1},
        "box_3": {x: 3, y: 4, width: 1, height: 1},
        "box_4": {x: 4, y: 4, width: 1, height: 1},
        "box_5": {x: 5, y: 4, width: 1, height: 1},
        "box_6": {x: 6, y: 4, width: 1, height: 1},
        "box_7": {x: 7, y: 4, width: 1, height: 1},
        "box_8": {x: 8, y: 4, width: 1, height: 1},
        "box_9": {x: 9, y: 4, width: 1, height: 1},
        "box_a": {x: 10, y: 4, width: 1, height: 1},
        "box_b": {x: 11, y: 4, width: 1, height: 1},

        "box_live": ["box_0", "box_1", "box_2", "box_3", "box_4",
            "box_4", "box_3", "box_2", "box_1", "box_0"],

        "box_weak": ["box_6", "box_7", "box_8", "box_9", "box_a", "box_b"],

        "box_mix": ["box_1", "box_0", "box_0", "box_1", "box_2",
            "box_6", "box_7", "box_8",
            "box_3", "box_4", "box_4", "box_3", "box_2",
            "box_9", "box_a", "box_b"],

        "box_dead": ["box_5"],

        "player_live": [
            {x: 0, y: 2, width: 1, height: 1},
            {x: 1, y: 2, width: 1, height: 1},
            {x: 2, y: 2, width: 1, height: 1},
            {x: 3, y: 2, width: 1, height: 1},
            {x: 4, y: 2, width: 1, height: 1},
            {x: 3, y: 2, width: 1, height: 1},
            {x: 2, y: 2, width: 1, height: 1},
            {x: 1, y: 2, width: 1, height: 1}
        ],

        "player_die": [
            {x: 2, y: 2, width: 1, height: 1},
            {x: 6, y: 2, width: 1, height: 1},
            {x: 5, y: 2, width: 1, height: 1},
            {x: 2, y: 2, width: 1, height: 1},
            {x: 6, y: 2, width: 1, height: 1},
            {x: 5, y: 2, width: 1, height: 1},
            {x: 2, y: 2, width: 1, height: 1},
            {x: 6, y: 2, width: 1, height: 1},
            {x: 5, y: 2, width: 1, height: 1},
            {x: 5, y: 2, width: 1, height: 1}
        ],

        "level": {
            "0": {x: 9, y: 1.35, width: 1, height: 0.3},
            "1": {x: 8.75, y: 1.35, width: 1, height: 0.3},
            "2": {x: 8.5, y: 1.35, width: 1, height: 0.3},
            "3": {x: 8.25, y: 1.35, width: 1, height: 0.3},
            "4": {x: 8, y: 1.35, width: 1.25, height: 0.3},
            "5": {x: 7.75, y: 1.35, width: 1.50, height: 0.3},
            "6": {x: 7.5, y: 1.35, width: 1.50, height: 0.3}
        },

        "skills_power": {x: 12, y: 3, width: 0.6, height: 0.27},
        "skills_energy": {x: 12, y: 3.5, width: 0.6, height: 0.27},
        "skills_faster": {x: 12, y: 4, width: 0.6, height: 0.27},
        "skills_attract": {x: 13, y: 3, width: 0.6, height: 0.27},
        "skills_repulse": {x: 13, y: 3.5, width: 0.6, height: 0.27},
        "skills_slow": {x: 13, y: 4, width: 0.6, height: 0.27},

        "godlike":{x:14,y:3,width:0.7,height:0.35},

        "cursor": {x: 8, y: 0, width: 1, height: 1},
        "energy": {x: 9, y: 0.3, width: 2, height: 0.4, left: 0.125, right: 0.125},
        "dot": {x: 11, y: 0, width: 1, height: 1},
        "power":{x:15,y:1,width:1,height:1},

        "number": {
            "0": {x: 0, y: 1.2, width: 0.3125, height: 0.625},
            "1": {x: 0.5, y: 1.2, width: 3.1 / 16, height: 0.625},
            "2": {x: 1, y: 1.2, width: 0.3125, height: 0.625},
            "3": {x: 1.5, y: 1.2, width: 0.3125, height: 0.625},
            "4": {x: 2, y: 1.2, width: 0.3125, height: 0.625},
            "5": {x: 2.5, y: 1.2, width: 0.3125, height: 0.625},
            "6": {x: 3, y: 1.2, width: 0.3125, height: 0.625},
            "7": {x: 3.5, y: 1.2, width: 0.3125, height: 0.625},
            "8": {x: 4, y: 1.2, width: 0.3125, height: 0.625},
            "9": {x: 4.5, y: 1.2, width: 0.3125, height: 0.625},
            ".": {x: 5, y: 1.2, width: 0.125, height: 0.625},
            "k": {x: 6, y: 1.2, width: 0.3125, height: 0.625},
            "M": {x: 6.5, y: 1.2, width: 0.7, height: 0.625},
            "$": {x: 5.5, y: 1.2, width: 0.3125, height: 0.625}
        },
		
		"border": {x: 12, y: 2, width: 1, height: 1, top: 1 / 8, bottom: 1 / 8, left: 1 / 8, right: 1 / 8},
        "page_1":{x:0,y:7,width:9,height:7},
        "page_2":{x:9,y:6,width:8,height:7}
    }
});