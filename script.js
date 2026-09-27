/* =========================================================
   段奕宏 好き顔9選
   59 → 30 → 20 → 10 → 9
   ========================================================= */


/* =========================
   基础数据
========================= */

const characters =
  dataSet[dataSetVersion].characterData.map(item => ({
    name: item.name,
    img: item.img
  }));


/* =========================
   DOM
========================= */

const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const resultScreen = document.getElementById("result-screen");

const startBtn = document.getElementById("start-btn");
const againBtn = document.getElementById("again-btn");

const roundTitle = document.getElementById("round-title");
const roundSubtitle = document.getElementById("round-subtitle");
const instruction = document.getElementById("instruction");
const progressBar = document.getElementById("progress-bar");
const groupContainer = document.getElementById("group-container");
const resultGrid = document.getElementById("result-grid");


/* =========================
   状态
========================= */

let players = [];
let winners = [];

let currentGroups = [];
let currentGroupIndex = 0;

let thirdRoundPlayers = [];
let thirdRoundWinners = [];

let rankingPool = [];
let finalRanking = [];

let locked = false;


/* =========================
   工具
========================= */

function shuffle(array) {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}


function showScreen(screen) {
  startScreen.classList.remove("active");
  gameScreen.classList.remove("active");
  resultScreen.classList.remove("active");

  screen.classList.add("active");
}


/* =========================
   开始
========================= */

startBtn.addEventListener("click", startGame);

againBtn.addEventListener("click", () => {
  location.reload();
});


function startGame() {

  players = shuffle(characters);

  winners = [];

  currentGroups = [];
  currentGroupIndex = 0;

  thirdRoundPlayers = [];
  thirdRoundWinners = [];

  rankingPool = [];
  finalRanking = [];

  locked = false;

  showScreen(gameScreen);

  startRound1();
}


/* =========================================================
   第一轮
   59人
   14组 × 4人
   最后3人单独成为一组
   每组 4选2 / 3选2
   最终30人
========================================================= */

function startRound1() {

  roundTitle.textContent = "ROUND 1";
  roundSubtitle.textContent = "4選2";
  instruction.textContent = "每组选择两张";

  winners = [];

  currentGroups = [];

  let index = 0;

  // 14组，每组4人
  for (let i = 0; i < 14; i++) {

    currentGroups.push(
      players.slice(index, index + 4)
    );

    index += 4;
  }

  // 剩下3人，重新作为最后一组
  const remaining = players.slice(index);

  if (remaining.length > 0) {
    currentGroups.push(remaining);
  }

  currentGroupIndex = 0;

  showCurrentGroup();
}


/* =========================================================
   第二轮
   30人
   10组 × 3人
   每组3选2
   最终20人
========================================================= */

function startRound2() {

  players = shuffle(winners);

  winners = [];

  currentGroups = [];

  let index = 0;

  while (index < players.length) {

    currentGroups.push(
      players.slice(index, index + 3)
    );

    index += 3;
  }

  currentGroupIndex = 0;

  roundTitle.textContent = "ROUND 2";
  roundSubtitle.textContent = "3選2";
  instruction.textContent = "每组三人中选择两张";

  showCurrentGroup();
}


/* =========================================================
   显示当前组
========================================================= */

function showCurrentGroup() {

  groupContainer.innerHTML = "";

  locked = false;

  const group = currentGroups[currentGroupIndex];

  if (!group || group.length === 0) {
    finishCurrentRound();
    return;
  }

  const size = group.length;

  if (size === 4) {
    groupContainer.className = "group-grid-4";
  }

  else if (size === 3) {
    groupContainer.className = "group-grid-3";
  }

  else {
    groupContainer.className = "group-grid-2v2";
  }

  group.forEach(character => {

    const card = createCard(character);

    groupContainer.appendChild(card);
  });

  updateProgress();
}


/* =========================
   创建卡片
========================= */

function createCard(character) {

  const card = document.createElement("div");

  card.className = "character-card";

  const img = document.createElement("img");

  img.loading = "lazy";
  img.src = character.img;
  img.alt = character.name;

  const name = document.createElement("div");

  name.className = "character-name";
  name.textContent = character.name;

  card.appendChild(img);
  card.appendChild(name);

  card.addEventListener("click", () => {

    if (locked) return;

    handleSelection(card, character);

  });

  return card;
}


/* =========================================================
   第一、二轮选择
========================================================= */

function handleSelection(card, character) {

  const group = currentGroups[currentGroupIndex];

  const required =
    group.length === 4 ? 2 :
    group.length === 3 ? 2 :
    1;

  if (card.classList.contains("selected")) {

    card.classList.remove("selected");

    const selected =
      [...groupContainer.querySelectorAll(".selected")];

    if (selected.length < required) {
      groupContainer
        .querySelectorAll(".character-card")
        .forEach(c => {
          c.classList.remove("eliminated");
        });
    }

    return;
  }

  const selected =
    [...groupContainer.querySelectorAll(".selected")];

  if (selected.length >= required) {
    return;
  }

  card.classList.add("selected");

  const nowSelected =
    [...groupContainer.querySelectorAll(".selected")];

  if (nowSelected.length === required) {

    locked = true;

    groupContainer
      .querySelectorAll(".character-card")
      .forEach(other => {

        if (!other.classList.contains("selected")) {
          other.classList.add("eliminated");
        }

      });

    setTimeout(() => {

      const selectedCharacters = [];

      nowSelected.forEach(selectedCard => {

        const name =
          selectedCard.querySelector(".character-name").textContent;

        const found =
          group.find(item => item.name === name);

        if (found) {
          selectedCharacters.push(found);
        }

      });

      winners.push(...selectedCharacters);

      currentGroupIndex++;

      if (currentGroupIndex < currentGroups.length) {

        showCurrentGroup();

      } else {

        finishCurrentRound();

      }

    }, 450);
  }
}


/* =========================================================
   第一、二轮结束
========================================================= */

function finishCurrentRound() {

  if (roundTitle.textContent === "ROUND 1") {

    // 必须正好30人
    if (winners.length !== 30) {
      console.error(
        "ROUND 1人数错误：",
        winners.length
      );
      return;
    }

    startRound2();

    return;
  }


  if (roundTitle.textContent === "ROUND 2") {

    // 必须正好20人
    if (winners.length !== 20) {
      console.error(
        "ROUND 2人数错误：",
        winners.length
      );
      return;
    }

    startRound3();

  }
}


/* =========================================================
   第三轮
   20人
   2 VS 2
   每次从4人中选择2人
   得到10人
========================================================= */

function startRound3() {

  thirdRoundPlayers = shuffle(winners);

  thirdRoundWinners = [];

  currentGroups = [];

  for (let i = 0; i < thirdRoundPlayers.length; i += 4) {

    currentGroups.push(
      thirdRoundPlayers.slice(i, i + 4)
    );

  }

  currentGroupIndex = 0;

  roundTitle.textContent = "ROUND 3";
  roundSubtitle.textContent = "2 VS 2";
  instruction.textContent = "四张脸中选择两张";

  showThirdRoundGroup();
}


/* =========================
   第三轮组
========================= */

function showThirdRoundGroup() {

  groupContainer.innerHTML = "";

  locked = false;

  const group =
    currentGroups[currentGroupIndex];

  groupContainer.className = "group-grid-2v2";

  group.forEach(character => {

    const card = createThirdRoundCard(character);

    groupContainer.appendChild(card);

  });

  updateProgress();
}


/* =========================
   第三轮选择
========================= */

function createThirdRoundCard(character) {

  const card = document.createElement("div");

  card.className = "character-card";

  const img = document.createElement("img");

  img.loading = "lazy";
  img.src = character.img;
  img.alt = character.name;

  const name = document.createElement("div");

  name.className = "character-name";
  name.textContent = character.name;

  card.appendChild(img);
  card.appendChild(name);

  card.addEventListener("click", () => {

    if (locked) return;

    const selected =
      [...groupContainer.querySelectorAll(".selected")];

    if (card.classList.contains("selected")) {

      card.classList.remove("selected");

      return;
    }

    if (selected.length >= 2) {
      return;
    }

    card.classList.add("selected");

    const current =
      [...groupContainer.querySelectorAll(".selected")];

    if (current.length === 2) {

      locked = true;

      groupContainer
        .querySelectorAll(".character-card")
        .forEach(other => {

          if (!other.classList.contains("selected")) {
            other.classList.add("eliminated");
          }

        });

      setTimeout(() => {

        const group =
          currentGroups[currentGroupIndex];

        current.forEach(selectedCard => {

          const selectedName =
            selectedCard.querySelector(".character-name").textContent;

          const found =
            group.find(item => item.name === selectedName);

          if (found) {
            thirdRoundWinners.push(found);
          }

        });

        currentGroupIndex++;

        if (currentGroupIndex < currentGroups.length) {

          showThirdRoundGroup();

        } else {

          // 20 → 10
          rankingPool =
            shuffle(thirdRoundWinners);

          startFinalElimination();

        }

      }, 450);
    }

  });

  return card;
}


/* =========================================================
   10人 → 9人
   先通过一次2 VS 2循环确定10人中的淘汰者
========================================================= */

function startFinalElimination() {

  roundTitle.textContent = "FINAL";
  roundSubtitle.textContent = "10 → 9";
  instruction.textContent = "从这一组中选择两张";

  /*
    这里把10人分成：
    2 + 2 + 2 + 2 + 2

    每组2人，进行比较。
    每组胜者晋级。

    这样得到5人。
    再用交叉比较重新确定最后的TOP9。

    为了不让一个人直接被随机淘汰，
    我们使用“最后一人挑战”机制：
    先得到5人，然后进行连续比较，
    最终留下9人的排名池。
  */

  // 实际最终排名采用完整排序机制
  beginRanking();
}


/* =========================================================
   最终排名
   10人进入排序
   使用连续两两比较建立真实顺序
   最后一名淘汰，只留下TOP9
========================================================= */

function beginRanking() {

  rankingPool = shuffle(rankingPool);

  finalRanking = [];

  roundTitle.textContent = "RANKING";
  roundSubtitle.textContent = "TOP 9";
  instruction.textContent = "两张脸中选择你更喜欢的一张";

  rankingStep();
}


/* =========================
   插入排序式排名
========================= */

let rankCandidate = null;
let rankIndex = 0;


function rankingStep() {

  if (rankingPool.length === 0) {

    showFinalResult();

    return;
  }

  rankCandidate = rankingPool.shift();

  if (finalRanking.length === 0) {

    finalRanking.push(rankCandidate);

    rankingStep();

    return;
  }

  rankIndex = 0;

  compareForRanking();

}


/* =========================
   排名比较
========================= */

function compareForRanking() {

  groupContainer.innerHTML = "";

  groupContainer.className = "group-grid-2v2";

  locked = false;

  const opponent =
    finalRanking[rankIndex];

  const cards = [
    rankCandidate,
    opponent
  ];

  cards.forEach(character => {

    const card = document.createElement("div");

    card.className = "character-card";

    const img = document.createElement("img");

    img.loading = "lazy";
    img.src = character.img;
    img.alt = character.name;

    const name = document.createElement("div");

    name.className = "character-name";
    name.textContent = character.name;

    card.appendChild(img);
    card.appendChild(name);

    card.addEventListener("click", () => {

      if (locked) return;

      locked = true;

      const chosen =
        character === rankCandidate;

      card.classList.add("selected");

      groupContainer
        .querySelectorAll(".character-card")
        .forEach(other => {

          if (other !== card) {
            other.classList.add("eliminated");
          }

        });

      setTimeout(() => {

        if (chosen) {

          finalRanking.splice(
            rankIndex,
            0,
            rankCandidate
          );

          rankCandidate = null;

          rankingStep();

        } else {

          rankIndex++;

          if (rankIndex >= finalRanking.length) {

            finalRanking.push(rankCandidate);

            rankCandidate = null;

            rankingStep();

          } else {

            compareForRanking();

          }

        }

      }, 400);

    });

    groupContainer.appendChild(card);

  });

  updateProgress();
}


/* =========================================================
   最终只取TOP9
========================================================= */

function showFinalResult() {

  /*
    finalRanking 是真实比较产生的顺序。
    这里不是随机排序。
  */

  const top9 =
    finalRanking.slice(0, 9);

  showScreen(resultScreen);

  resultGrid.innerHTML = "";

  top9.forEach((character, index) => {

    const card = document.createElement("div");

    card.className = "result-card";

    const img = document.createElement("img");

    img.src = character.img;
    img.alt = character.name;

    const rank = document.createElement("div");

    rank.className = "result-rank";
    rank.textContent = index + 1;

    const name = document.createElement("div");

    name.className = "result-name";
    name.textContent = character.name;

    card.appendChild(img);
    card.appendChild(rank);
    card.appendChild(name);

    resultGrid.appendChild(card);

  });
}


/* =========================
   进度条
========================= */

function updateProgress() {

  let total = currentGroups.length;

  let current = currentGroupIndex;

  if (total <= 0) {

    progressBar.style.width = "0%";

    return;

  }

  const percentage =
    Math.min(
      100,
      (current / total) * 100
    );

  progressBar.style.width =
    percentage + "%";
}
