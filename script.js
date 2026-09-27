const GROUP_SIZE = 4;
const MIN_REMAIN = 19;

let photos = [];
let groups = [];
let currentGroup = 0;
let selected = [];
let finalists = [];

let battlePairs = [];
let currentBattle = 0;
let ranking = [];


function shuffle(array) {
    let arr = [...array];

    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}


function createPhotos() {

    photos = dataSet[dataSetVersion].characterData.map(
        (character, index) => ({
            id: index,
            name: character.name,
            src: character.img
        })
    );

    photos = shuffle(photos);
}

function startGame() {
    createPhotos();
    createGroups();

    document.getElementById("startPage")
        .classList.add("hidden");

    document.getElementById("round1")
        .classList.remove("hidden");

    showGroup();
}


function createGroups() {
    groups = [];

    for (let i = 0; i < photos.length; i += GROUP_SIZE) {
        groups.push(
            photos.slice(i, i + GROUP_SIZE)
        );
    }
}


function showGroup() {
    const group = groups[currentGroup];

    document.getElementById("roundInfo").innerText =
        `第 ${currentGroup + 1} / ${groups.length} 组`;

    selected = [];

    updateSelectedInfo();

    const container =
        document.getElementById("group");

    container.innerHTML = "";

    group.forEach(photo => {

        const card = document.createElement("div");

        card.className = "card";

        card.innerHTML = `
            <img src="${photo.src}">
        `;

        card.onclick = () => {

            if (selected.includes(photo.id)) {

                selected =
                    selected.filter(id => id !== photo.id);

                card.classList.remove("selected");

            } else {

                selected.push(photo.id);

                card.classList.add("selected");
            }

            updateSelectedInfo();
        };

        container.appendChild(card);
    });
}


function updateSelectedInfo() {
    document.getElementById("selectedInfo").innerText =
        `本轮选择 ${selected.length} 张`;
}


function nextGroup() {

    const group = groups[currentGroup];

    group.forEach(photo => {

        if (selected.includes(photo.id)) {
            finalists.push(photo);
        }
    });

    currentGroup++;

    if (currentGroup >= groups.length) {
        finishRound1();
    } else {
        showGroup();
    }
}


function finishRound1() {

    if (finalists.length < MIN_REMAIN) {

        const notSelected =
            photos.filter(photo =>
                !finalists.some(
                    x => x.id === photo.id
                )
            );

        const need =
            MIN_REMAIN - finalists.length;

        finalists.push(
            ...shuffle(notSelected).slice(0, need)
        );
    }

    finalists = shuffle(finalists);

    startBattle();
}


function startBattle() {

    document.getElementById("round1")
        .classList.add("hidden");

    document.getElementById("round2")
        .classList.remove("hidden");

    ranking = [];
    currentBattle = 0;

    createBattlePairs();

    showBattle();
}


function createBattlePairs() {

    battlePairs = [];

    let list = shuffle(finalists);

    for (let i = 0; i < list.length; i += 2) {

        if (list[i + 1]) {

            battlePairs.push([
                list[i],
                list[i + 1]
            ]);
        }
    }
}


function showBattle() {

    if (currentBattle >= battlePairs.length) {
        finishBattle();
        return;
    }

    const pair =
        battlePairs[currentBattle];

    document.getElementById("battleInfo").innerText =
        `第 ${currentBattle + 1} / ${battlePairs.length} 组`;

    const container =
        document.getElementById("battle");

    container.innerHTML = "";

    pair.forEach(photo => {

        const card =
            document.createElement("div");

        card.className = "battleCard";

        card.innerHTML = `
            <img src="${photo.src}">
        `;

        card.onclick = () => {

            ranking.push(photo);

            currentBattle++;

            showBattle();
        };

        container.appendChild(card);
    });
}


function finishBattle() {

    finalists.forEach(photo => {

        if (!ranking.some(
            x => x.id === photo.id
        )) {
            ranking.push(photo);
        }
    });

    const top9 =
        ranking.slice(0, 9);

    showResult(top9);
}


function showResult(top9) {

    document.getElementById("round2")
        .classList.add("hidden");

    document.getElementById("result")
        .classList.remove("hidden");

    const container =
        document.getElementById("resultList");

    container.innerHTML = "";

    top9.forEach((photo, index) => {

        const card =
            document.createElement("div");

        card.className = "resultCard";

        card.innerHTML = `
            <span class="rank">
                ${index + 1}
            </span>

            <img src="${photo.src}">
        `;

        container.appendChild(card);
    });
}
