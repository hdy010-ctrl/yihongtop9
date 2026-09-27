let allCharacters = [];

let currentRound = [];

let nextRound = [];

let currentGroup = [];

let groupIndex = 0;

let totalGroups = 0;

let roundNumber = 1;

let finalWinners = [];


/* =========================
   随机打乱
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
        ] = [
            result[j],
            result[i]
        ];
    }

    return result;
}


/* =========================
   初始化
========================= */

function initializeCharacters() {

    allCharacters =
        dataSet[
            dataSetVersion
        ].characterData.map(
            (character, index) => ({

                id: index,

                name:
                    character.name,

                img:
                    character.img

            })
        );

}


/* =========================
   开始
========================= */

document
    .getElementById("startButton")
    .addEventListener(
        "click",
        startGame
    );


function startGame() {

    initializeCharacters();

    currentRound =
        shuffle(allCharacters);

    roundNumber = 1;

    startRound();

}


/* =========================
   根据人数决定每组大小
========================= */

function getGroupSize(count) {

    if (count > 30) {

        return 4;

    }

    if (count > 15) {

        return 3;

    }

    if (count > 9) {

        return 2;

    }

    return 1;

}


/* =========================
   开始一轮
========================= */

function startRound() {

    nextRound = [];

    groupIndex = 0;

    const groupSize =
        getGroupSize(
            currentRound.length
        );


    /*
       把当前轮选手随机打乱
    */

    currentRound =
        shuffle(currentRound);


    /*
       分组
    */

    const groups = [];


    for (
        let i = 0;
        i < currentRound.length;
        i += groupSize
    ) {

        groups.push(
            currentRound.slice(
                i,
                i + groupSize
            )
        );

    }


    window.currentGroups = groups;

    totalGroups =
        groups.length;


    /*
       显示游戏页面
    */

    document
        .getElementById("startScreen")
        .classList.add(
            "hidden"
        );

    document
        .getElementById("resultScreen")
        .classList.add(
            "hidden"
        );

    document
        .getElementById("gameScreen")
        .classList.remove(
            "hidden"
        );


    showGroup();

}


/* =========================
   显示一组
========================= */

function showGroup() {

    const group =
        window.currentGroups[
            groupIndex
        ];


    document
        .getElementById("roundTitle")
        .textContent =
        `ROUND ${roundNumber}`;


    document
        .getElementById("progress")
        .textContent =
        `${groupIndex + 1} / ${totalGroups}`;


    document
        .getElementById("groupNumber")
        .textContent =
        `GROUP ${groupIndex + 1}`;


    const container =
        document
            .getElementById(
                "groupContainer"
            );


    container.innerHTML = "";


    /*
       如果最后剩下的人不足标准组大小，
       就全部放出来。
    */


    group.forEach(
        character => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "photoCard";


            card.innerHTML = `

                <img
                    src="${character.img}"
                    alt="${character.name}"
                >

                <div class="photoName">
                    ${character.name}
                </div>

            `;


            card.addEventListener(
                "click",
                () => {

                    chooseCharacter(
                        character
                    );

                }
            );


            container.appendChild(
                card
            );

        }
    );

}


/* =========================
   选择一个
========================= */

function chooseCharacter(character) {

    /*
       当前组只有一个胜者
    */

    nextRound.push(
        character
    );


    /*
       下一组
    */

    groupIndex++;


    if (
        groupIndex <
        totalGroups
    ) {

        showGroup();

        return;

    }


    /*
       本轮结束
    */

    finishRound();

}


/* =========================
   一轮结束
========================= */

function finishRound() {

    /*
       本轮晋级人数
    */

    const winners =
        shuffle(nextRound);


    /*
       如果已经 <= 9
       进入最终排名
    */

    if (
        winners.length <= 9
    ) {

        startFinalRanking(
            winners
        );

        return;

    }


    /*
       继续下一轮
    */

    currentRound =
        winners;

    roundNumber++;

    startRound();

}


/* =========================
   最终9人排名
========================= */

function startFinalRanking(winners) {

    /*
       这里开始真正决定
       TOP 9 的顺序。
    */

    finalWinners =
        shuffle(winners);


    /*
       先做第一名
    */

    rankNextPerson(
        finalWinners
    );

}


/* =========================
   逐个决定最终排名
========================= */

function rankNextPerson(list) {

    if (
        list.length === 0
    ) {

        showResult();

        return;

    }


    /*
       第一名直接通过
       后面的排序采用
       逐个插入比较
    */

    if (
        !window.finalRanking
    ) {

        window.finalRanking = [];

    }


    /*
       如果还没有排名，
       先让第一人进入
    */

    if (
        window.finalRanking.length === 0
    ) {

        window.finalRanking.push(
            list[0]
        );

        rankNextPerson(
            list.slice(1)
        );

        return;

    }


    /*
       当前需要插入的人
    */

    const candidate =
        list[0];


    /*
       从第一名开始比较
    */

    compareForRanking(
        candidate,
        0,
        list.slice(1)
    );

}


/* =========================
   排名比较
========================= */

function compareForRanking(
    candidate,
    position,
    remaining
) {

    /*
       已经排到最后
    */

    if (
        position >=
        window.finalRanking.length
    ) {

        window.finalRanking.push(
            candidate
        );

        rankNextPerson(
            remaining
        );

        return;

    }


    const current =
        window.finalRanking[
            position
        ];


    /*
       暂时使用浏览器弹窗选择
       这部分下一步可以改成
       两张大图的漂亮PK界面。
    */

    const chooseCandidate =
        confirm(
            `这一轮比较：\n\n` +
            `${candidate.name}\n\n` +
            `vs\n\n` +
            `${current.name}\n\n` +
            `确定 = 选择 ${candidate.name}\n` +
            `取消 = 选择 ${current.name}`
        );


    if (
        chooseCandidate
    ) {

        window.finalRanking.splice(
            position,
            0,
            candidate
        );

        rankNextPerson(
            remaining
        );

    } else {

        compareForRanking(
            candidate,
            position + 1,
            remaining
        );

    }

}


/* =========================
   最终结果
========================= */

function showResult() {

    const ranking =
        window.finalRanking
            .slice(0, 9);


    document
        .getElementById("gameScreen")
        .classList.add(
            "hidden"
        );

    document
        .getElementById("resultScreen")
        .classList.remove(
            "hidden"
        );


    const container =
        document
            .getElementById(
                "resultContainer"
            );


    container.innerHTML = "";


    ranking.forEach(
        (character, index) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "resultCard";


            card.innerHTML = `

                <div class="resultRank">
                    ${index + 1}
                </div>

                <img
                    src="${character.img}"
                    alt="${character.name}"
                >

                <div class="resultName">
                    ${character.name}
                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}


/* =========================
   AGAIN
========================= */

document
    .getElementById("restartButton")
    .addEventListener(
        "click",
        () => {

            window.finalRanking =
                [];

            document
                .getElementById(
                    "resultScreen"
                )
                .classList.add(
                    "hidden"
                );

            document
                .getElementById(
                    "startScreen"
                )
                .classList.remove(
                    "hidden"
                );

        }
    );
