
const crypto = require('crypto');
const mongoose = require('mongoose');
const createCandidate = require('../models/candidateModel');
const createVoteResult = require('../models/votingModel')
const createVoter = require('../models/voterModel');
const Election = require('../models/electionModel');
const { checkIfEmpty, checkIfStringIsZero } = require('../Service/commonService');


async function getVotes (req, res) {
  try {
    const votes = await getAllVotes();
    res.status(200).json(votes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve votes' });
  }
};

async function vote (req, res) {
  try {
    const { election_name ,candidate_Id, name, mail } = req.body;

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'DemocracyU',
    });

    let Elections = await Election.findOne({election_name : election_name});
    console.log(Elections)
    //check election exist
    checkIfEmpty(Elections, "Election not found")
    //check candidate exist
    let Candidate = createCandidate(Elections.candidate_table);
    let candidates = await Candidate.findOne({id : candidate_Id})
    console.log(candidates)
    checkIfEmpty(candidates, "Candidate not found")
    //check 
    let Voter = createVoter(Elections.voter_table)
    let voters = await Voter.findOne({mail : mail})
    console.log(voters)
    checkIfStringIsZero(voters.status, "Voter has been voted")


    let VoteResult = createVoteResult(Elections.voteResult_table)
    
    const blockchain = new Blockchain();
    await blockchain.initialize(VoteResult);
    
    const hashed_data = crypto.createHash('sha256').update(name+mail).digest('hex');
    
    await blockchain.addBlock(candidate_Id, hashed_data)

    //Add edit status user after vote <-- ปรับเป้นผู้ไม่สิทธิ์โหวตด้วย
    await Voter.updateOne(
      {mail : mail},
      { $set: { status: '1' } }
    )
    
    res.status(200).json({ message: 'Vote cast successfully' });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message || 'Failed to cast vote' });
  }finally{
    mongoose.connection.close();
  }
};


class Blockchain {
  constructor() {
      this.chain = [];
      this.difficulty = 2;
      this.model = "";
  }

  async initialize(model) {
    try {
        mongoose.connection.close();

        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: 'DemocracyU',
        });
        console.log('MongoDB Connected');

        this.model = model;
        // Initialize blockchain operations
        await this.createGenesisBlock();
        // Other initialization tasks can be added here
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        // Handle error appropriately
        throw error; // Rethrow the error or handle it as needed
    }
}

  async createGenesisBlock() {
      const genesisBlock = await this.model.findOne({ index: 0 });

      if (!genesisBlock) {
          const newBlock = this.createBlock(0, "Genesis Candidate ID", "Genesis Hashed Data", "0");
          this.mineBlock(newBlock);
          await newBlock.save();
          this.chain.push(newBlock);
      } else {
          this.chain.push(genesisBlock);
      }
  }

  createBlock(index, candidate_id, hashed_data, previous_hash) {
      const nonce = '0';
      const hash = this.calculateHash(index, candidate_id, hashed_data, previous_hash, nonce);
      return new this.model({ index, candidate_id, hashed_data, previous_hash, nonce, hash });
  }

  calculateHash(index, candidate_id, hashed_data, previous_hash, nonce) {
      return crypto.createHash('sha256').update(index.toString() + candidate_id + hashed_data + previous_hash + nonce).digest('hex');
  }

  mineBlock(block) {
      while (block.hash.substring(0, this.difficulty) !== Array(this.difficulty + 1).join("0")) {
          block.nonce = (BigInt(block.nonce) + 1n).toString();
          block.hash = this.calculateHash(block.index, block.candidate_id, block.hashed_data, block.previous_hash, block.nonce);
      }
  }

  async getLatestBlock() {
      return await this.model.findOne().sort({ index: -1 });
  }

  async addBlock(candidate_id, hashed_data) {
      const latestBlock = await this.getLatestBlock();
      const newIndex = latestBlock.index + 1;
      const newBlock = this.createBlock(newIndex, candidate_id, hashed_data, latestBlock.hash);
      this.mineBlock(newBlock);
      await newBlock.save();
      this.chain.push(newBlock);
  }

  async isChainValid() {
      for (let i = 1; i < this.chain.length; i++) {
          const currentBlock = this.chain[i];
          const previousBlock = this.chain[i - 1];

          if (currentBlock.hash !== this.calculateHash(currentBlock.index, currentBlock.candidate_id, currentBlock.hashed_data, currentBlock.previous_hash, currentBlock.nonce)) {
              return false;
          }

          if (currentBlock.previous_hash !== previousBlock.hash) {
              return false;
          }
      }
      return true;
  }
}


module.exports = {vote};
