const path = require('path')
const input = require('./input.json')
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const friends = input.friends
const noOfFriends = friends.length
const responseMap = Array(noOfFriends).fill(0).map(_ => Array(noOfFriends).fill(0))

const csvWriter = createCsvWriter({
    path: path.join(__dirname, `output_${Math.floor(Math.random() * 1000)}.csv`),
    header: [
        {id: 'person1', title: 'Person1'},
        {id: 'statement', title: 'Statement'},
        {id: 'person2', title: 'Person2'},
        {id: 'amount', title: 'Amount'}
    ]
});


async function calculateExpenses() {
    for (const exp of input.expenses) {
        let distributedAmount = exp.amount / exp.splitBetween.length
        let paidByIndex = friends.indexOf(exp.paidBy)

        if (paidByIndex < 0) {
            continue
        }
    
        for (const person of exp.splitBetween) {
            let currentPersonIndex = friends.indexOf(person)

            if (currentPersonIndex < 0) {
                continue
            }
    
            if (paidByIndex !== currentPersonIndex) {
                responseMap[currentPersonIndex][paidByIndex] -= distributedAmount
                responseMap[paidByIndex][currentPersonIndex] += distributedAmount
            }
        }
    }
    for (let index = 0; index < responseMap.length; index ++) {
        let respInnerArr = responseMap[index]
        let toWrite = respInnerArr.map((amount, innerIndex) => {
            if (innerIndex !== index && amount !== 0) {
                return {
                    person1: friends[index],
                    statement: amount > 0 ? 'will receive from' : 'owes',
                    person2: friends[innerIndex],
                    amount: Math.abs(amount).toFixed(2)
                }
            }
            return undefined
        }).filter(x => !!x)
        await csvWriter.writeRecords(toWrite)
    }
}

calculateExpenses()