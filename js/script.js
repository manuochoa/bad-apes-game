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

let userAddress = "";
let provider;
let signer;
let isWaitlisted = false;

async function connectWallet() {
  if (userAddress === "") {
    console.log("hola");
    try {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();
      console.log("Account:", await signer.getAddress());
      userAddress = await signer.getAddress();
      checkWaitListed();
    } catch (error) {
      console.log(error);
    }
  } else if (!isWaitlisted) {
    console.log("joining waitlist");
    const waitListContract = new ethers.Contract(
      "0xf642Dc5B0faeF6b108C1522a7402360DB15E90Cd",
      ["function addMyself () public"],
      signer
    );

    let result = await waitListContract.addMyself();
    console.log(result);
    checkWaitListed();
  } else {
    console.log("already on waitlist");
  }
}

async function checkWaitListed() {
  const waitListContract = new ethers.Contract(
    "0xf642Dc5B0faeF6b108C1522a7402360DB15E90Cd",
    [" function isWhitelisted(address _address) public view returns(bool)"],
    provider
  );

  let result = await waitListContract.isWhitelisted(userAddress);
  if (result) {
    document.getElementById("waitListButton").innerHTML = "Already Added";
    isWaitlisted = true;
  } else {
    document.getElementById("waitListButton").innerHTML = "Join the Waitlist";
  }
  console.log(result, "is waitlisted?");
}
