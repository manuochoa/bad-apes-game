function copyToClipboard(text) {
  var sampleTextarea = document.createElement("textarea");
  document.body.appendChild(sampleTextarea);
  sampleTextarea.value = text; //save main text in it
  sampleTextarea.select(); //select textarea contenrs
  document.execCommand("copy");
  document.body.removeChild(sampleTextarea);
}

function clipboardFunction() {
  var copyText = document.getElementById("clipboardInput");
  copyToClipboard(copyText.value);
}

/*
var container = document.querySelector(".main-game");

var activeItem = null;

var active = false;

container.addEventListener("touchstart", dragStart, false);
container.addEventListener("touchend", dragEnd, false);
container.addEventListener("touchmove", drag, false);

container.addEventListener("mousedown", dragStart, false);
container.addEventListener("mouseup", dragEnd, false);
container.addEventListener("mousemove", drag, false);


function dragStart(e) {
  if (e.target !== e.currentTarget) {
    active = true;

    // this is the item we are interacting with
    activeItem = e.target;

    if (activeItem !== null) {
      if (!activeItem.xOffset) {
        activeItem.xOffset = 0;
      }

      if (!activeItem.yOffset) {
        activeItem.yOffset = 0;
      }

      if (e.type === "touchstart") {
        activeItem.initialX = e.touches[0].clientX - activeItem.xOffset;
        activeItem.initialY = e.touches[0].clientY - activeItem.yOffset;
      } else {
        console.log("doing something!");
        activeItem.initialX = e.clientX - activeItem.xOffset;
        activeItem.initialY = e.clientY - activeItem.yOffset;
      }
    }
  }
}

function dragEnd(e) {
  if (activeItem !== null) {
    activeItem.initialX = activeItem.currentX;
    activeItem.initialY = activeItem.currentY;
  }

  active = false;
  activeItem = null;
}

function drag(e) {
  if (active) {
    if (e.type === "touchmove") {
      e.preventDefault();

      activeItem.currentX = e.touches[0].clientX - activeItem.initialX;
      activeItem.currentY = e.touches[0].clientY - activeItem.initialY;
    } else {
      activeItem.currentX = e.clientX - activeItem.initialX;
      activeItem.currentY = e.clientY - activeItem.initialY;
    }

    activeItem.xOffset = activeItem.currentX;
    activeItem.yOffset = activeItem.currentY;

    setTranslate(activeItem.currentX, activeItem.currentY, activeItem);
  }
}

function setTranslate(xPos, yPos, el) {
  el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
}
*/

let userAddress = "";
let userApes = {
  staked: [],
  unstaked: [],
};
let userStakedIds = [];
let isWaitlisted = false;
let selectedToken;

let provider = new ethers.providers.Web3Provider(window.ethereum);
let signer = provider.getSigner(0);

let goldContract = new ethers.Contract(
  "0x48197AFc712c337B91F4FDb15aF0433955E14f7C",
  GLDabi,
  signer
);
let BAYCContract = new ethers.Contract(
  "0xc59fc09706206C993Ba8C13e59D6ab7Ef7423144",
  GLDabi,
  signer
);
let apesContract = new ethers.Contract(
  "0x898E794de5275DbcF8c8F3De89c82dF87C6897C4",
  ApesABI,
  signer
);
let mineContract = new ethers.Contract(
  "0x32689268aCb71e85F12E4e59a2492F1905a8e209",
  MineABI,
  signer
);

async function connectWallet() {
  if (userAddress === "") {
    console.log("hola");
    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      userAddress = accounts[0];

      if (userAddress) {
        contractData();
        getUserApes(true);
      }

      window.localStorage.setItem("userAddress", userAddress);

      document.getElementById(
        "connect-button"
      ).innerHTML = `${userAddress.slice(0, 6)}...${userAddress.slice(-6)}`;
    } catch (error) {
      console.log(error);
    }
  } else {
    userAddress = "";
    document.getElementById("connect-button").innerHTML = "CONNECT WALLET";
  }
}

async function mintOneApe() {
  loading("start");
  if (userApes.staked.length + userApes.unstaked.length > 5) {
    loading("end");
    return window.alert("MAX 5 per wallet limit set");
  }

  if (!whitelist.find((el) => userAddress.toLowerCase() == el.toLowerCase())) {
    loading("end");
    return window.alert("Only Whitelisted Addresses");
  }

  try {
    let { messageHash, signature } = await signMessage();

    let result = await apesContract.regularMint(true, messageHash, signature, {
      gasLimit: 500000,
      value: ethers.utils.parseEther("0.69420"),
    });

    console.log(result);
    const receipt = await result.wait();
    if (receipt) {
      getUserApes(true);
      contractData();
    }
  } catch (error) {
    console.log(error);
  }
  loading("end");
}

async function mintWithBAYC() {
  loading("start");
  if (userApes.staked.length + userApes.unstaked.length > 5) {
    loading("end");
    return window.alert("MAX 5 per wallet limit set");
  }

  if (!whitelist.find((el) => userAddress.toLowerCase() == el.toLowerCase())) {
    loading("end");
    return window.alert("Only Whitelisted Addresses");
  }

  if (!(await checkAllowance())) {
    await increaseAllowance();
  }

  try {
    let { messageHash, signature } = await signMessage();

    let result = await apesContract.mintWithBAYCtoken(
      true,
      messageHash,
      signature,
      {
        gasLimit: 600000,
      }
    );

    console.log(result);
    const receipt = await result.wait();
    if (receipt) {
      getUserApes(true);
      contractData();
    }
  } catch (error) {
    console.log(error);
  }
  loading("end");
}

async function checkAllowance() {
  let result = await BAYCContract.allowance(
    userAddress,
    "0x898E794de5275DbcF8c8F3De89c82dF87C6897C4"
  );
  console.log(result > 0);

  return result > 0;
}

async function increaseAllowance() {
  console.log("allowance");
  let result = await BAYCContract.approve(
    "0x898E794de5275DbcF8c8F3De89c82dF87C6897C4",
    "9999999999999999999999999999"
  );

  const receipt = await result.wait();
  console.log(receipt);
}

async function handleStake(tokenId) {
  try {
    let result = await mineContract.addManyToMineAndPack(userAddress, [
      tokenId,
    ]);
    console.log(result);
    const receipt = await result.wait();
    if (receipt) {
      getUserApes(true);
      contractData();
    }
  } catch (error) {
    console.log(error);
    if (error.data.message) {
      window.alert(error.data.message);
    }
  }
}
async function handleUnstake() {
  try {
    let result = await mineContract.claimManyFromMineAndPack(
      [selectedToken],
      true
    );
    console.log(result);
    const receipt = await result.wait();
    if (receipt) {
      getUserApes(true);
      contractData();
    }
  } catch (error) {
    console.log(error, "error");
    if (error.data.message) {
      window.alert(error.data.message);
    }
  }
}

function preUnstake(tokenId) {
  selectedToken = tokenId;
}

async function claimGold() {
  try {
    let result = await mineContract.claimManyFromMineAndPack(
      userStakedIds,
      false
    );
    console.log(result);
    const receipt = await result.wait();
    if (receipt) {
      getUserApes(false);
      contractData();
    }
  } catch (error) {
    console.log(error, "error");
    if (error.data.message) {
      window.alert(error.data.message);
    }
  }
}

async function contractData() {
  let apesContract = new ethers.Contract(
    "0x898E794de5275DbcF8c8F3De89c82dF87C6897C4",
    ApesABI,
    provider
  );
  let mineContract = new ethers.Contract(
    "0x32689268aCb71e85F12E4e59a2492F1905a8e209",
    MineABI,
    provider
  );
  let minted = (await apesContract.totalSupply()).toString();
  let badApes = (await apesContract.badApes()).toString();
  let minersStaked = (await mineContract.totalApesMining()).toString();
  let badStaked = (await mineContract.totalBadApes()).toString();
  let goldMinted = ((await mineContract.totalGoldEarned()) / 10 ** 18).toFixed(
    0
  );

  document.getElementById("minted-miners").innerHTML = minted - badApes;
  document.getElementById("minted-bad-apes").innerHTML = badApes;
  document.getElementById("staked-miners").innerHTML = minersStaked;
  document.getElementById("staked-bad-apes").innerHTML = badStaked;
  document.getElementById("claimed-gold-mobile").innerHTML = goldMinted;
  document.getElementById("claimed-gold").innerHTML = goldMinted;
}

async function getUserApes(reloadApes) {
  if (reloadApes) {
    const badApesDiv = document.getElementById("bad-apes-list");
    const minersDiv = document.getElementById("miners-list");
    minersDiv.innerHTML = "";
    badApesDiv.innerHTML = "";
  }
  let goldEarned = 0;
  let miners = 0;
  let badApes = 0;
  let stakedIds = await mineContract.getTokensForOwner(userAddress);
  let goldPerAlpha = await mineContract.goldPerAlpha();
  let BAYCbalance = await BAYCContract.balanceOf(userAddress);
  let GLDbalance = await goldContract.balanceOf(userAddress);

  userApes.staked = stakedIds;

  await Promise.all(
    stakedIds.map(async (el) => {
      let tokenInfo = await apesContract.tokenInfo(el);
      let stakeInfo;

      userStakedIds.push(el.toString());

      if (tokenInfo.isMiner) {
        stakeInfo = await mineContract.mine(el);
        let timeStaked = Date.now() / 1000 - stakeInfo.value;
        goldEarned = goldEarned + timeStaked * 0.11574;
        miners++;
        let days = Math.trunc(timeStaked / 3600);
        if (reloadApes) {
          addApes(days, (timeStaked * 0.11574).toFixed(0), true, el);
        }
      } else {
        let alpha = tokenInfo.strengthIndex;
        let alphaValue;
        if (Number(alpha) === 0) {
          alphaValue = "SIGMA";
        } else if (Number(alpha) === 1) {
          alphaValue = "ALPHA";
        } else if (Number(alpha) === 2) {
          alphaValue = "ZETA";
        } else if (Number(alpha) === 3) {
          alphaValue = "BETA";
        }
        let packIndex = await mineContract.packIndices(el);
        stakeInfo = await mineContract.pack(8 - alpha, packIndex);
        badApes++;
        let earnings = (8 - alpha) * (goldPerAlpha - stakeInfo.value);
        goldEarned = goldEarned + earnings / 10 ** 18;
        if (reloadApes) {
          addBadApes(goldEarned.toFixed(0), true, alphaValue, el);
        }
      }

      return { ...tokenInfo, ...stakeInfo };
    })
  );

  let unstakedIds = await apesContract.walletOfOwner(userAddress);
  userApes.unstaked = unstakedIds;

  await Promise.all(
    unstakedIds.map(async (el) => {
      let tokenInfo = await apesContract.tokenInfo(el);
      if (tokenInfo.isMiner) {
        if (reloadApes) {
          addApes("", "0", false, el);
        }
        miners++;
      } else {
        let alpha = tokenInfo.strengthIndex;
        let alphaValue;
        if (Number(alpha) === 0) {
          alphaValue = "SIGMA";
        } else if (Number(alpha) === 1) {
          alphaValue = "ALPHA";
        } else if (Number(alpha) === 2) {
          alphaValue = "ZETA";
        } else if (Number(alpha) === 3) {
          alphaValue = "BETA";
        }

        badApes++;
        if (reloadApes) {
          addBadApes("", false, alphaValue, el);
        }
      }
      return tokenInfo;
    })
  );

  document.getElementById("user-gold-mined").innerHTML = goldEarned.toFixed(0);
  document.getElementById("user-gold-fee").innerHTML = (
    goldEarned * 0.2
  ).toFixed(0);
  document.getElementById("user-gold-claimable").innerHTML = (
    goldEarned * 0.8
  ).toFixed(0);
  document.getElementById("user-miners-count").innerHTML = miners;
  document.getElementById("user-badapes-count").innerHTML = badApes;
  document.getElementById("user-bayc-balance").innerText = (
    BAYCbalance /
    10 ** 18
  )
    .toFixed(0)
    .toLocaleString("en-US");
  document.getElementById("user-gold-balance").innerText = (
    GLDbalance /
    10 ** 18
  )
    .toFixed(0)
    .toLocaleString("en-US");
  document.getElementById("user-bayc-balance-mobile").innerText = (
    BAYCbalance /
    10 ** 18
  )
    .toFixed(0)
    .toLocaleString("en-US");
  document.getElementById("user-gold-balance-mobile").innerText = (
    GLDbalance /
    10 ** 18
  )
    .toFixed(0)
    .toLocaleString("en-US");
}

function loading(status) {
  if (status === "start") {
    document.getElementById("mint-button").innerHTML = "Loading";
    document.getElementById("mint-bayc-button").innerHTML = "Loading";
  } else if (status === "end") {
    document.getElementById("mint-button").innerHTML = "Mint";
    document.getElementById("mint-bayc-button").innerHTML = "Mint with BAYC";
  }
}

function addApes(timeStaked, gold, staked, tokenId) {
  // create a new div element
  const main = document.createElement("div");
  main.classList.add("status-item");

  const time = document.createElement("div");
  time.classList.add("status-time");
  if (staked) {
    time.innerHTML = `${timeStaked} HOURS`;
  } else {
    time.innerHTML = ``;
  }

  const image = document.createElement("img");
  image.src = `./img/mnk-${getRandomInt(4) + 1}.png`;
  image.classList.add("status-img");

  const status = document.createElement("div");
  status.classList.add("status-count");

  const goldIcon = document.createElement("img");
  goldIcon.src = "./img/gold.png";

  const text = document.createElement("p");
  if (staked) {
    text.textContent = gold;
  } else {
    text.textContent = "0";
  }

  status.appendChild(goldIcon);
  status.appendChild(text);

  const button = document.createElement("button");
  if (!staked) {
    button.classList.add("btn-decoration");
    button.innerHTML = "stake";
    button.onclick = function () {
      handleStake(tokenId);
    };
  } else {
    button.classList.add("btn-staked");
    button.dataset.target = "#unstakeModal";
    button.dataset.toggle = "modal";
    button.innerHTML = "unstake";
    button.onclick = function () {
      preUnstake(tokenId);
    };
  }

  // add the text node to the newly created div
  main.appendChild(time);
  main.appendChild(image);
  main.appendChild(status);
  main.appendChild(button);

  // add the newly created element and its content into the DOM
  const currentDiv = document.getElementById("miners-list");
  currentDiv.appendChild(main);
}

function addBadApes(earning, staked, alphaValue, tokenId) {
  const main = document.createElement("div");
  main.classList.add("personage-item");

  const alpha = document.createElement("h3");
  alpha.classList.add("personage-title");
  alpha.innerText = alphaValue;

  const imgContainer = document.createElement("div");
  imgContainer.classList.add("personage-img-block");

  const timeContainer = document.createElement("div");
  timeContainer.classList.add("personage-title");
  timeContainer.classList.add("status-count");

  const goldIcon = document.createElement("img");
  goldIcon.src = "./img/gold.png";

  const text = document.createElement("p");

  if (staked) {
    text.textContent = earning;
  } else {
    text.textContent = "0";
  }

  timeContainer.appendChild(goldIcon);
  timeContainer.appendChild(text);

  const image = document.createElement("img");
  image.src = `./img/bdaMonke-${getRandomInt(2) + 1}.png`;
  image.classList.add("personage-img");

  const button = document.createElement("button");
  button.classList.add("btn-staked");
  if (staked) {
    button.innerHTML = "unstake";
    button.onclick = function () {
      handleUnstake(tokenId);
    };
  } else {
    button.innerHTML = "stake";
    button.onclick = function () {
      handleStake(tokenId);
    };
  }

  // imgContainer.appendChild(timeContainer);
  imgContainer.appendChild(image);
  // imgContainer.appendChild(button);

  main.appendChild(alpha);
  main.appendChild(imgContainer);

  // add the newly created element and its content into the DOM
  const currentDiv = document.getElementById("bad-apes-list");
  currentDiv.appendChild(main);
}

async function signMessage() {
  const web3 = new Web3(Web3.givenProvider);
  const hash = web3.utils.soliditySha3(
    {
      t: "address",
      v: userAddress,
    },
    { t: "uint256", v: Date.now() }
  );

  let result = await web3.eth.accounts.sign(
    hash,
    "ffded2686ffa6ea341cad618740ecfc92963dcf01f169051830ed59a5611fdae"
  );

  return result;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function refreshData() {
  console.log("refreshing");
  if (userAddress !== "") {
    getUserApes(false);
  }
  contractData();
}

function checkUser() {
  let user = window.localStorage.getItem("userAddress");
  if (user) {
    connectWallet();
  }

  contractData();
}

checkUser();
