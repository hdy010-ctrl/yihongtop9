/* ==================================================
   TOP 9
   59 → 30 → 15 → 9

   每组只能选择一个人
================================================== */


/* =========================
   游戏数据
========================= */

let characters = [];

let currentPlayers = [];

let nextPlayers = [];

let groups = [];

let currentGroupIndex = 0;

let currentRound = 1;


/* =========================
   DOM
========================= */

const startScreen =
    document.getElementById("startScreen");

const gameScreen =
    document.getElementById("gameScreen");

const resultScreen =
    document.getElementById("resultScreen");

const startButton =
    document.getElementById("startButton");

const againButton =
    document.getElementById("againButton");

const groupContainer =
    document.getElementById("groupContainer");

const roundName =
    document.getElementById("roundName");

const roundDescription =
    document.getElementById("roundDescription");

const groupCurrent =
    document.getElementById("groupCurrent");

const groupTotal =
    document.getElementById("groupTotal");

const progressFill =
    document.getElementById("progressFill");

const resultContainer =
    document.getElementById("resultContainer");


/* =========================
   随机排序
========================= */

function shuffle(array) {

    const result = [...array];

    for (
        let i = result.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            result[i],
            result[j]
        ] =
        [
            result[j],
            result[i]
        ];
    }

    return result;
}


/* =========================
   读取你的 data.js
========================= */

function loadCharacters() {

    if (
        typeof dataSet === "undefined"
    ) {

        alert(
            "data.js 没有成功加载。"
        );

        return false;
    }


    if (
        typeof dataSetVersion === "undefined"
    ) {

        alert(
            "dataSetVersion 没有找到。"
        );

        return false;
    }


    if (
        !dataSet[dataSetVersion]
    ) {

        alert(
            "dataSetVersion 对应的数据不存在。"
        );

        return false;
    }


    const source =
        dataSet[dataSetVersion]
            .characterData;


    if (
        !Array.isArray(source)
    ) {

        alert(
            "characterData 不是数组。"
        );

        return false;
    }


    if (
        source.length < 9
    ) {

        alert(
            "角色数量少于9个。"
        );

        return false;
    }


    characters =
        source.map(
            (item, index) => ({

                id: index,

                name:
                    item.name,

                img:
                    item.img

            })
        );


    return true;
}


/* =========================
   开始游戏
========================= */

startButton.addEventListener(
    "click",
    startGame
);


function startGame() {

    const loaded =
        loadCharacters();


    if (!loaded) {

        return;

    }


    /*
       你的最终数据应该是59个
    */

    currentPlayers =
        shuffle(characters);


    currentRound = 1;

    nextPlayers = [];

    currentGroupIndex = 0;


    startScreen
        .classList
        .add("hidden");


    resultScreen
        .classList
        .add("hidden");


    gameScreen
        .classList
        .remove("hidden");


    createRound();

}


/* =========================
   创建轮次
========================= */

function createRound() {

    nextPlayers = [];

    currentGroupIndex = 0;


    /*
       根据当前人数决定这一轮
       最终目标：

       59 → 30
       30 → 15
       15 → 9
    */

    let target;


    if (
        currentPlayers.length > 30
    ) {

        target = 30;

    }
    else if (
        currentPlayers.length > 15
    ) {

        target = 15;

    }
    else {

        target = 9;

    }


    groups =
        makeGroups(
            currentPlayers,
            target
        );


    updateRoundTitle();

    showCurrentGroup();

}


/* =========================
   创建分组
========================= */

function makeGroups(
    players,
    targetWinners
) {

    const shuffled =
        shuffle(players);


    const groupCount =
        targetWinners;


    const result = [];

    const baseSize =
        Math.floor(
            shuffled.length /
            groupCount
        );

    const extra =
        shuffled.length %
        groupCount;


    let index = 0;


    for (
        let i = 0;
        i < groupCount;
        i++
    ) {

        /*
           尽可能平均分配。

           59 → 30：
           29个2人组 + 1个1人组

           30 → 15：
           15个2人组

           15 → 9：
           6个2人组 + 3个1人组
        */

        const size =
            baseSize +
            (i < extra ? 1 : 0);


        const group =
            shuffled.slice(
                index,
                index + size
            );


        index += size;


        if (
            group.length > 0
        ) {

            result.push(group);

        }

    }


    return result;
}


/* =========================
   顶部文字
========================= */

function updateRoundTitle() {

    if (
        currentRound === 1
    ) {

        roundName.textContent =
            "ROUND 1";

        roundDescription.textContent =
            "59 → 30";

    }
    else if (
        currentRound === 2
    ) {

        roundName.textContent =
            "ROUND 2";

        roundDescription.textContent =
            "30 → 15";

    }
    else {

        roundName.textContent =
            "ROUND 3";

        roundDescription.textContent =
            "15 → 9";

    }


    groupTotal.textContent =
        groups.length;

}


/* =========================
   显示当前组
========================= */

function showCurrentGroup() {

    const group =
        groups[currentGroupIndex];


    groupCurrent.textContent =
        currentGroupIndex + 1;


    groupTotal.textContent =
        groups.length;


    const progress =
        (
            currentGroupIndex /
            groups.length
        ) * 100;


    progressFill.style.width =
        `${progress}%`;


    groupContainer.innerHTML = "";


    /*
       如果这一组只有一个人
       自动晋级。

       这是为了处理：
       59→30 和 15→9
       不能整除的问题。
    */

    if (
        group.length === 1
    ) {

        showSingle(group[0]);

        return;

    }


    group.forEach(
        character => {

            const card =
                createCharacterCard(
                    character
                );


            groupContainer
                .appendChild(card);

        }
    );

}


/* =========================
   创建人物卡
========================= */

function createCharacterCard(
    character
) {

    const card =
        document.createElement("div");


    card.className =
        "character-card";


    const img =
        document.createElement("img");


    img.src =
        character.img;

    img.alt =
        character.name;


    /*
       如果图片路径有问题，
       显示一个明显提示。
    */

    img.onerror =
        function () {

            this.alt =
                "图片加载失败";

        };


    const name =
        document.createElement("div");


    name.className =
        "character-name";


    name.textContent =
        character.name;


    card.appendChild(img);

    card.appendChild(name);


    card.addEventListener(
        "click",
        () => {

            chooseWinner(
                character,
                card
            );

        }
    );


    return card;
}


/* =========================
   单人自动晋级
========================= */

function showSingle(character) {

    groupContainer.innerHTML = "";


    const card =
        createCharacterCard(
            character
        );


    card.classList.add(
        "single-card"
    );


    groupContainer
        .appendChild(card);


    /*
       单人不用选择，
       稍微停一下再自动晋级。
    */

    setTimeout(
        () => {

            nextPlayers.push(
                character
            );

            nextGroup();

        },
        450
    );

}


/* =========================
   选择胜者
========================= */

let choosing = false;


function chooseWinner(
    character,
    clickedCard
) {

    if (choosing) {

        return;

    }


    choosing = true;


    /*
       把所有卡片锁住
    */

    const cards =
        document.querySelectorAll(
            ".character-card"
        );


    cards.forEach(card => {

        card.style.pointerEvents =
            "none";

    });


    /*
       被选择的人
    */

    clickedCard.classList.add(
        "selected"
    );


    /*
       其他人淡出
    */

    cards.forEach(card => {

        if (
            card !== clickedCard
        ) {

            card.classList.add(
                "eliminated"
            );

        }

    });


    /*
       等动画结束
    */

    setTimeout(
        () => {

            nextPlayers.push(
                character
            );

            choosing = false;

            nextGroup();

        },
        350
    );

}


/* =========================
   下一组
========================= */

function nextGroup() {

    currentGroupIndex++;


    if (
        currentGroupIndex <
        groups.length
    ) {

        showCurrentGroup();

        return;

    }


    /*
       当前轮全部完成
    */

    finishRound();

}


/* =========================
   本轮结束
========================= */

function finishRound() {

    /*
       最终人数应该是：

       ROUND 1 = 30
       ROUND 2 = 15
       ROUND 3 = 9
    */

    if (
        nextPlayers.length <= 9
    ) {

        showFinalResult(
            nextPlayers
        );

        return;

    }


    currentPlayers =
        shuffle(nextPlayers);


    currentRound++;


    createRound();

}


/* =========================
   TOP 9
========================= */

function showFinalResult(
    winners
) {

    /*
       最后9个人再随机一次，
       只是为了让最终展示顺序
       不固定受分组顺序影响。
    */

    const top9 =
        shuffle(winners);


    resultContainer.innerHTML = "";


    top9.forEach(
        (character, index) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "result-card";


            card.innerHTML = `

                <div class="rank-number">
                    ${index + 1}
                </div>

                <img
                    src="${character.img}"
                    alt="${character.name}"
                >

                <div class="result-name">
                    ${character.name}
                </div>

            `;


            resultContainer
                .appendChild(card);

        }
    );


    progressFill.style.width =
        "100%";


    gameScreen
        .classList
        .add("hidden");


    resultScreen
        .classList
        .remove("hidden");

}


/* =========================
   AGAIN
========================= */

againButton.addEventListener(
    "click",
    () => {

        currentPlayers = [];

        nextPlayers = [];

        groups = [];

        currentGroupIndex = 0;

        currentRound = 1;

        choosing = false;


        resultScreen
            .classList
            .add("hidden");


        startScreen
            .classList
            .remove("hidden");

    }
);
