#!/usr/bin/env node
// Deploy Policy Processor LAW on X Layer and tape out 5 real circuits
// Updated with protocolFee fix discovered via Stego repo
// Usage: PRIVATE_KEY=0x... node deploy-xlayer.mjs
// For existing processor: PROCESSOR_ADDRESS=0x... TRANSISTOR_ADDRESS=0x... PRIVATE_KEY=0x... node deploy-xlayer.mjs

import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { defineChain } from 'viem';
import fs from 'fs';

const xLayer = defineChain({
  id: 196,
  name: "X Layer",
  network: "xlayer",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.xlayer.tech", "https://xlayerrpc.okx.com"] } },
});

const FACTORY = "0x1f09DAeFA827f02CBb40967cc91b259763760761";
const FACTORY_ABI = [
  { inputs: [{name:"name",type:"string"},{name:"symbol",type:"string"},{name:"story",type:"string"},{name:"transistorSupply",type:"uint256"},{name:"mintPrice",type:"uint256"}], name:"createCPU", outputs:[{name:"transistors",type:"address"},{name:"circuits",type:"address"}], stateMutability:"payable", type:"function"},
  { inputs:[], name:"deployFee", outputs:[{type:"uint256"}], stateMutability:"view", type:"function"},
  { inputs:[], name:"protocolFee", outputs:[{type:"uint256"}], stateMutability:"view", type:"function"},
  { inputs:[{name:"circuits",type:"address"}], name:"isCPU", outputs:[{type:"bool"}], stateMutability:"view", type:"function"},
];
const PROCESSOR_ABI = [
  { inputs:[{name:"circuitId",type:"uint256"},{name:"input",type:"bytes"}], name:"eval", outputs:[{type:"bytes"}], stateMutability:"view", type:"function"},
  { inputs:[{name:"circuitId",type:"uint256"}], name:"circuitInfo", outputs:[{name:"nIn",type:"uint32"},{name:"nOut",type:"uint32"},{name:"nState",type:"uint32"},{name:"gateCount",type:"uint32"}], stateMutability:"view", type:"function"},
  { inputs:[{name:"nl",type:"bytes"},{name:"nIn",type:"uint32"},{name:"nOut",type:"uint32"}], name:"tapeout", outputs:[{type:"uint256"}], stateMutability:"payable", type:"function"},
  { inputs:[], name:"TAPEOUT_FEE", outputs:[{type:"uint256"}], stateMutability:"view", type:"function"},
  { inputs:[], name:"nextId", outputs:[{type:"uint256"}], stateMutability:"view", type:"function"},
  { inputs:[], name:"transistors", outputs:[{type:"address"}], stateMutability:"view", type:"function"},
];
const TRANSISTOR_ABI = [
  { inputs:[{name:"id",type:"uint256"},{name:"amount",type:"uint256"}], name:"mint", outputs:[], stateMutability:"payable", type:"function"},
  { inputs:[], name:"mintPrice", outputs:[{type:"uint256"}], stateMutability:"view", type:"function"},
  { inputs:[], name:"supplyCap", outputs:[{type:"uint256"}], stateMutability:"view", type:"function"},
  { inputs:[], name:"minted", outputs:[{type:"uint256"}], stateMutability:"view", type:"function"},
  { inputs:[{name:"account",type:"address"},{name:"id",type:"uint256"}], name:"balanceOf", outputs:[{type:"uint256"}], stateMutability:"view", type:"function"},
  { inputs:[], name:"owed", outputs:[{type:"uint256"}], stateMutability:"view", type:"function"},
  { inputs:[], name:"withdraw", outputs:[], stateMutability:"nonpayable", type:"function"},
];

const circuitsToDeploy = [
  { name: "SpendLimit", file: "./SpendLimit.bin", nIn:2, nOut:1, gates:2 },
  { name: "Quorum2of3", file: "./Quorum2of3.bin", nIn:3, nOut:1, gates:12 },
  { name: "MoodASIC", file: "./MoodASIC.bin", nIn:4, nOut:1, gates:12 },
  { name: "DeadMan", file: "./DeadMan.bin", nIn:3, nOut:1, gates:6 },
  { name: "RuleMux", file: "./RuleMux.bin", nIn:5, nOut:1, gates:18 },
];

async function main() {
  const pk = process.env.PRIVATE_KEY;
  if (!pk || !process.argv.includes('--broadcast') || !process.argv.includes('--acknowledge-mainnet-costs')) {
    console.log("DRY RUN. Broadcasting requires a private key AND --broadcast --acknowledge-mainnet-costs.");
    for (const c of circuitsToDeploy) {
      const bytes = fs.readFileSync(c.file);
      console.log(`${c.name}: ${bytes.length} bytes, ${c.gates} gates, nIn=${c.nIn} nOut=${c.nOut}, hex=0x${bytes.toString('hex').slice(0,64)}...`);
    }
    console.log("\nTo deploy on X Layer:");
    console.log("1. Get OKB from https://www.okx.com/xlayer/faucet or bridge");
    console.log("2. Use a secure local environment; explicit broadcast flags are required. Never paste keys in chat.");
    console.log("3. Factory 0x1f09... will create Processor with 2.3M supply @ 0.000066 OKB");
    console.log("4. Mint requires mintPrice*n + protocolFee (0.00066 OKB per batch)");
    return;
  }

  const account = privateKeyToAccount(pk);
  const publicClient = createPublicClient({ chain: xLayer, transport: http("https://rpc.xlayer.tech") });
  const walletClient = createWalletClient({ account, chain: xLayer, transport: http("https://rpc.xlayer.tech") });

  console.log(`Deployer: ${account.address}`);
  const balance = await publicClient.getBalance({address: account.address});
  console.log(`Balance: ${balance} wei (${Number(balance)/1e18} OKB)`);

  const deployFee = await publicClient.readContract({ address: FACTORY, abi: FACTORY_ABI, functionName: "deployFee" });
  const protocolFee = await publicClient.readContract({ address: FACTORY, abi: FACTORY_ABI, functionName: "protocolFee" });
  console.log(`Factory deployFee: ${deployFee} wei = ${Number(deployFee)/1e18} OKB`);
  console.log(`Factory protocolFee: ${protocolFee} wei = ${Number(protocolFee)/1e18} OKB`);

  let processorAddr = process.env.PROCESSOR_ADDRESS;
  let transistorAddr = process.env.TRANSISTOR_ADDRESS;

  if (!processorAddr) {
    console.log("\nCreating CPU: Policy Processor (LAW) - 2.3M supply @ 0.000066 OKB");
    const mintPrice = 66000000000000n;
    const supply = 2300000n;
    const { result, request } = await publicClient.simulateContract({
      address: FACTORY,
      abi: FACTORY_ABI,
      functionName: "createCPU",
      args: ["Policy Processor", "LAW", "Inspectable Boolean policy circuits. 2.3M transistor cap, 0.000066 OKB unit mint price plus fees. Vault integration is a prototype; no collateral, yield, or security guarantee.", supply, mintPrice],
      value: deployFee,
      account,
    });
    console.log(`Simulated: transistors=${result[0]}, circuits=${result[1]}`);
    const hash = await walletClient.writeContract(request);
    console.log(`Tx sent: ${hash} - waiting...`);
    const receipt = await publicClient.waitForTransactionReceipt({hash});
    console.log(`Mined in block ${receipt.blockNumber}, gasUsed ${receipt.gasUsed}`);
    processorAddr = result[1];
    transistorAddr = result[0];
    console.log(`Processor: ${processorAddr}`);
    console.log(`Transistors: ${transistorAddr}`);
  } else {
    console.log(`Using existing Processor: ${processorAddr}`);
    console.log(`Using existing Transistors: ${transistorAddr}`);
  }

  // Check existing balance and minted
  const transistorAddrChecksummed = transistorAddr;
  const existingBal = await publicClient.readContract({ address: transistorAddrChecksummed, abi: TRANSISTOR_ABI, functionName: "balanceOf", args:[account.address, 0n] });
  const minted = await publicClient.readContract({ address: transistorAddrChecksummed, abi: TRANSISTOR_ABI, functionName: "minted" });
  console.log(`\nTransistor balance id0: ${existingBal}, total minted: ${minted}`);

  const neededTotal = circuitsToDeploy.reduce((s,c)=>s+c.gates,0); // 50
  const needToMint = neededTotal - Number(existingBal);
  console.log(`Need total ${neededTotal} gates, have ${existingBal}, need to mint ${Math.max(0,needToMint)}`);

  if (needToMint > 0) {
    const mintPrice = await publicClient.readContract({ address: transistorAddrChecksummed, abi: TRANSISTOR_ABI, functionName: "mintPrice" });
    const cost = mintPrice * BigInt(needToMint) + protocolFee;
    console.log(`Minting ${needToMint} transistors cost ${cost} wei = ${Number(cost)/1e18} OKB (mintPrice*${needToMint}+protocolFee)`);
    try {
      const { request } = await publicClient.simulateContract({
        address: transistorAddrChecksummed,
        abi: TRANSISTOR_ABI,
        functionName: "mint",
        args: [0n, BigInt(needToMint)],
        value: cost,
        account,
      });
      const hash = await walletClient.writeContract(request);
      console.log(`Mint tx: ${hash}`);
      const receipt = await publicClient.waitForTransactionReceipt({hash});
      console.log(`Mined block ${receipt.blockNumber} status ${receipt.status} gasUsed ${receipt.gasUsed}`);
      const newBal = await publicClient.readContract({ address: transistorAddrChecksummed, abi: TRANSISTOR_ABI, functionName: "balanceOf", args:[account.address, 0n] });
      console.log(`New balance: ${newBal}`);
      // Withdraw creator proceeds to recycle funds (like Stego)
      try {
        const owed = await publicClient.readContract({ address: transistorAddrChecksummed, abi: TRANSISTOR_ABI, functionName: "owed" });
        console.log(`Owed to creator: ${owed} wei, withdrawing...`);
        if (owed > 0n) {
          const { request: wReq } = await publicClient.simulateContract({
            address: transistorAddrChecksummed,
            abi: TRANSISTOR_ABI,
            functionName: "withdraw",
            account,
          });
          const wHash = await walletClient.writeContract(wReq);
          console.log(`Withdraw tx: ${wHash}`);
          await publicClient.waitForTransactionReceipt({hash:wHash});
          console.log(`Withdrawn`);
        }
      } catch(e){ console.log(`Withdraw failed: ${e.message.slice(0,200)}`); }
    } catch (e) {
      console.log("Mint failed:", e.message.slice(0,600));
    }
  }

  // Tape out circuits
  const tapeoutFee = await publicClient.readContract({ address: processorAddr, abi: PROCESSOR_ABI, functionName: "TAPEOUT_FEE" });
  console.log(`\nTapeout fee: ${tapeoutFee} wei = ${Number(tapeoutFee)/1e18} OKB per circuit`);
  const nextIdBefore = await publicClient.readContract({ address: processorAddr, abi: PROCESSOR_ABI, functionName: "nextId" });
  console.log(`nextId before: ${nextIdBefore}`);

  for (const c of circuitsToDeploy) {
    // Skip if already taped? Check if we have enough circuits
    const nextId = await publicClient.readContract({ address: processorAddr, abi: PROCESSOR_ABI, functionName: "nextId" });
    if (Number(nextId) > 5) {
      console.log(`\nAlready have ${nextId} circuits, skipping remaining`);
      break;
    }
    const bytes = fs.readFileSync(c.file);
    const hex = "0x"+bytes.toString('hex');
    console.log(`\nTaping out ${c.name}: ${bytes.length} bytes, ${c.gates} gates, nIn=${c.nIn} nOut=${c.nOut}`);
    try {
      const { result, request } = await publicClient.simulateContract({
        address: processorAddr,
        abi: PROCESSOR_ABI,
        functionName: "tapeout",
        args: [hex, c.nIn, c.nOut],
        value: tapeoutFee,
        account,
      });
      console.log(`Simulated circuitId: ${result}`);
      const hash = await walletClient.writeContract(request);
      console.log(`Tx: ${hash}`);
      const receipt = await publicClient.waitForTransactionReceipt({hash});
      console.log(`Mined: block ${receipt.blockNumber}, circuitId ${result}, gasUsed ${receipt.gasUsed}`);
      const info = await publicClient.readContract({ address: processorAddr, abi: PROCESSOR_ABI, functionName: "circuitInfo", args: [result] });
      console.log(`Verified on-chain: nIn=${info[0]} nOut=${info[1]} gates=${info[3]}`);
    } catch (e) {
      console.log(`Tapeout failed for ${c.name}:`, e.message.slice(0,600));
    }
  }

  const nextIdAfter = await publicClient.readContract({ address: processorAddr, abi: PROCESSOR_ABI, functionName: "nextId" });
  console.log(`\nnextId after: ${nextIdAfter}`);
  console.log("\n=== FINAL DEPLOYMENT SUMMARY ===");
  console.log(`Factory: ${FACTORY}`);
  console.log(`Processor: ${processorAddr}`);
  console.log(`Transistors: ${transistorAddr}`);
  console.log(`Deployer: ${account.address}`);
  console.log(`Circuits: ${circuitsToDeploy.map(c=>`${c.name} ${c.gates}g ${c.file.replace('./','')}`).join(', ')}`);
  console.log(`Total gates: ${neededTotal}, exhaustive: ${circuitsToDeploy.map(c=>Math.pow(2,c.nIn)).join('+')}=68`);
}

main().catch(e=>{ console.error(e); process.exit(1); });
