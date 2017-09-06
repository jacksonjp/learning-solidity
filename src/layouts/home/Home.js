import React, { Component } from 'react';
import { connect } from 'react-redux';
import VotingContract from '../../../build/contracts/Voting.json';
import { default as contract } from 'truffle-contract';
var voting = contract(VotingContract);
class Home extends Component {
  constructor() {
    super();
    this.state = {
      votes: {
        Jackson: 0,
        Vyshakh: 0,
        Jobin: 0
      },
      votesUpdated: false
    };
    this.voteForCandidate = this.voteForCandidate.bind(this);
  }
  voteForCandidate(candidateName) {
    try {
      /* Voting.deployed() returns an instance of the contract. Every call
     * in Truffle returns a promise which is why we have used then()
     * everywhere we have a transaction call
     */
      var web3 = this.props.web3;
      var that = this;
      if (typeof web3 !== 'undefined') {
        voting.deployed().then(function(contractInstance) {
          contractInstance
            .voteForCandidate(candidateName, {
              gas: 140000,
              from: web3.eth.accounts[0]
            })
            .then(function() {
              return contractInstance.totalVotesFor
                .call(candidateName)
                .then(function(v) {
                  const votes = that.state.votes;
                  votes[candidateName] = v.toString();
                  that.setState(votes);
                });
            });
        });
      }
    } catch (err) {
      console.log(err);
    }
  }
  updateVotes() {
    if (this.props.web3) {
      voting.setProvider(this.props.web3.currentProvider);
      let candidateNames = Object.keys(this.state.votes);
      var that = this;
      for (var i = 0; i < candidateNames.length; i++) {
        let name = candidateNames[i];
        voting.deployed().then(function(contractInstance) {
          contractInstance.totalVotesFor.call(name).then(function(v) {
            const votes = that.state.votes;
            votes[name] = v.toString();
            that.setState(votes);
          });
        });
      }
    }
  }
  componentWillReceiveProps(newProps) {
    if (newProps.web3 && !this.state.votesUpdated) {
      this.setState({ votesUpdated: true }, function() {
        this.updateVotes();
      });
    }
  }
  render() {
    let candidateNames = Object.keys(this.state.votes);
    const list = candidateNames.map(function(c, key) {
      return (
        <div key={key}>
          <button onClick={() => this.voteForCandidate(c)}>
            {' '}
            Vote for {c}
          </button>
          Total Votes : {this.state.votes[c]}
        </div>
      );
    }, this);
    return (
      <main className="container">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>Good to Go!</h1>
            {list}
          </div>
        </div>
      </main>
    );
  }
}
const mapStateToProps = (state, ownProps) => {
  return {
    web3: state.web3.web3Instance
  };
};
export default connect(mapStateToProps)(Home);
