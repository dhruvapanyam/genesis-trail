/*
 * SPDX-License-Identifier: Apache-2.0
 */



 /*

Query Request:

node query.js <username> <productID> <choice>
choice = "certificates" or "history"

 */

'use strict';

const {FileSystemWallet, Gateway} = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', 'basic-network', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
let productID;
let user;
let choice;

process.argv.forEach(function (val, index, array) {
    // console.log(index + ': ' + val);
    productID = array[3];
    user = array[2];
    choice = array[4];
});

async function main() {
    try {

        // Create a new file system based wallet for managing identities.
        console.log(__dirname)
        console.log('path:',path.resolve(__dirname))
        const walletPath = path.join(path.resolve(__dirname), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(user);
        if (!userExists) {
            console.log(`An identity for the user ${user} does not exist in the wallet`);
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {wallet, identity: user, discovery: {enabled: false}});

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabchat');

        // Evaluate the specified transaction.
        // queryMsg transaction - requires 1 argument, ex: ('queryMsg', 'MSG0')
        // queryAllMsgs transaction - requires no arguments, ex: ('queryAllMsgs')
        if (choice === "certificates") {
            const result = await contract.evaluateTransaction('getCertificates',productID);
            let temp_result = JSON.parse(result)
            console.log('OUTPUT:')
            console.log(JSON.stringify(temp_result))
            // for (let res of temp_result)
            //     console.log(res)
            // console.log(`TransactionTypeAll has been evaluated, result is: ${result.toString()}`);
        } else if (choice === "pending") {
            const result = await contract.evaluateTransaction('getPendingValidations',user);
            let temp_result = JSON.parse(result)
            console.log('OUTPUT:')
            console.log(JSON.stringify(temp_result))
            // console.log('received',temp_result.length,'txns')
            // for (let res of temp_result)
            //     console.log(res)
            // console.log(`TransactionTypeAll has been evaluated, result is: ${result.toString()}`);
        } else if (choice === "getAll") {
            const result = await contract.evaluateTransaction('getCompleteChainstate',user);
            let temp_result = JSON.parse(result)
            console.log('OUTPUT:')
            console.log(JSON.stringify(temp_result))
            // console.log('received',temp_result.length,'txns')
            // for (let res of temp_result)
            //     console.log(res)
            // console.log(`TransactionTypeAll has been evaluated, result is: ${result.toString()}`);
        } else if (choice === "viewUser") {
            const result = await contract.evaluateTransaction('viewUser',productID);
            let temp_result = JSON.parse(result)
            console.log('OUTPUT:')
            console.log(JSON.stringify(temp_result))
            // console.log('received',temp_result.length,'txns')
            // for (let res of temp_result)
            //     console.log(res)
            // console.log(`TransactionTypeAll has been evaluated, result is: ${result.toString()}`);
        } else {
            const result = await contract.evaluateTransaction('queryMaster', productID);
            console.log()
            let temp_result = JSON.parse(result)
            console.log('OUTPUT:')
            console.log(JSON.stringify(temp_result))
            // for (let res in temp_result)
            //     console.log(res, temp_result[res])
            // console.log(`TransactionTypeID has been evaluated, result is: ${result.toString()}`);
        }

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

main();
