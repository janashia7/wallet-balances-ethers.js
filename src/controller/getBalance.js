const { ethers } = require('ethers');
const schedule = require('node-schedule');
const axios = require('axios');
const fs = require('fs');
const moment = require('moment');
const ERC20_ABI = require('../constants/ABI');
const convertToNumber = require('../utils/convertToNum');
require('dotenv').config();

const getBalance = async (req, res) => {
  console.log(process.env.PROVIDER, process.env.WALLET_ADDRESS);
  const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER);

  const block = await provider.getBlockNumber();
  const {
    data: { tokens },
  } = await axios.get('https://tokens.coingecko.com/uniswap/all.json');

  const getAllTokenBalances = async (tokenList, wallet, block) => {
    // array to store all balance requests
    let proms = [];
    // array to store balances
    let results = [];

    for (const tkn of tokenList) {
      console.log(tkn, 'tkn');
      const erc20 = new ethers.Contract(tkn.address, ERC20_ABI, provider);
      proms.push(
        erc20.balanceOf(wallet, {
          blockTag: +block,
        })
      );
    }

    console.log(proms, 'prom');
    // actually requests all balances simultaneously
    const promiseResults = await Promise.allSettled(proms);
    console.log(promiseResults, 'promresult');
    // loop through all responses to format response
    for (let i = 0; i < promiseResults.length; i++) {
      // transforms balance to decimal
      console.log('in forloop');
      const balance = convertToNumber(
        promiseResults[i].value,
        tokenList[i].decimals
      );
      console.log(balance, 'balance');
      // save balance with token name and symbol

      results.push({
        name: tokenList[i].name,
        symbol: tokenList[i].symbol,
        balance,
        timestamp: moment().format('MMMM Do YYYY, h:mm:ss a'),
      });
    }
    console.log('results3', results);
    return results;
  };

  schedule.scheduleJob('* * * * *', async () => {
    console.log('here');
    const results = await getAllTokenBalances(
      tokens,
      process.env.WALLET_ADDRESS,
      block
    );
    console.log('here2');
    results.sort((a, b) => b.balance - a.balance);
    console.log('result', results);
    fs.writeFileSync('./token-balances.json', JSON.stringify(results));
    console.log('Result of token balances is in token-balances.json file');
  });
};

module.exports = getBalance;
