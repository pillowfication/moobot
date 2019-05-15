const State = {
  PENDING: 'pending',
  ELECTION: 'election',
  ELECTION_VOTE: 'election vote',
  LEGISLATIVE_SESSION: 'legislative session',
  EXECUTIVE_ACTION: 'executive action'
}
const Role = {
  HITLER: 'hitler',
  FACIST: 'facist',
  LIBERAL: 'liberal'
}
const Vote = {
  YES: 'yes',
  NO: 'no'
}
const ElectionResult = {
  PASSED: 'passed',
  FAILED: 'failed',
  ANARCHY: 'anarchy'
}
const Policy = {
  LIBERAL: 'liberal',
  FACIST: 'facist'
}
const ExecutivePower = {
  POLICY_PEEK: 'policy peek',
  INVESTIGATE_LOYALTY: 'investigate loyalty',
  SPECIAL_ELECTION: 'special election',
  EXECUTION: 'execution',
  VETO_POWER: 'veto power'
}

function shuffle (arr) {
  for (let i = arr.length - 1; i > 0; --i) {
    const j = (i + 1) * Math.random() | 0
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

module.exports = class SecretHitler {
  constructor () {
    this.state = State.PENDING
  }

  initialize (users) {
    const {
      HITLER,
      FACIST,
      LIBERAL
    } = Role
    const roles = shuffle(({
      5: [ HITLER, FACIST, LIBERAL, LIBERAL, LIBERAL ],
      6: [ HITLER, FACIST, LIBERAL, LIBERAL, LIBERAL, LIBERAL ],
      7: [ HITLER, FACIST, FACIST, LIBERAL, LIBERAL, LIBERAL, LIBERAL ],
      8: [ HITLER, FACIST, FACIST, LIBERAL, LIBERAL, LIBERAL, LIBERAL, LIBERAL ],
      9: [ HITLER, FACIST, FACIST, FACIST, LIBERAL, LIBERAL, LIBERAL, LIBERAL, LIBERAL ],
      10: [ HITLER, FACIST, FACIST, FACIST, LIBERAL, LIBERAL, LIBERAL, LIBERAL, LIBERAL, LIBERAL ]
    })[users.size])

    this.players = shuffle(users.array().map((user, index) => ({
      user,
      role: roles[index],
      isAlive: true,
      isInvestigated: false
    })))
    this.state = State.ELECTION
    this.presidentPlacard = 0
    this.previousPresident = null
    this.previousChancellor = null
    this.failedGovernmentsCount = 0
    this.chancellorCandidate = null
    this.policyDeck = shuffle([ ...Array(6).fill(Policy.LIBERAL), ...Array(11).fill(Policy.FACIST) ])
    this.discardDeck = []
    this.passedLiberalPoliciesCount = 0
    this.passedFacistPoliciesCount = 0
    this.executiveActionInPlay = null
  }

  _findPlayer (user) {
    return this.players.find(player => player.user.id === user.id)
  }

  getState () {
    return this.state
  }

  getPlayers () {
    return this.players.map(player => player.user)
  }

  getAlivePlayers () {
    return this.players.filter(player => player.isAlive).map(player => player.user)
  }

  getPlayerRole (user) {
    return this._findPlayer(user).role
  }

  getPlayersWithRole (role) {
    return this.players
      .filter(player => player.role === role)
      .map(player => player.user)
  }

  getPlayerById (id) {
    const player = this._findPlayer({ id })
    return player && player.user
  }

  getPresidentialCandidate () {
    return this.players[this.presidentPlacard].user
  }

  getPreviousPresident () {
    return this.previousPresident
  }

  getPreviousChancellor () {
    return this.previousChancellor
  }

  getIneligibleCandidates () {
    const ineligibleCandidates = []
    if (this.previousPresident && this.previousPresident.isAlive) {
      ineligibleCandidates.push(this.previousPresident)
    }
    if (this.previousChancellor && this.previousChancellor.isAlive) {
      ineligibleCandidates.push(this.previousChancellor)
    }
    return ineligibleCandidates
  }

  getFailedGovernmentsCount () {
    return this.failedGovernmentsCount
  }

  getExecutiveActionInPlay () {
    return this.executiveActionInPlay
  }

  isAlive (user) {
    return this._findPlayer(user).isAlive
  }

  isEligible (user) {
    return this.isAlive(user) &&
      (this.previousPresident === null || this.previousPresident.id !== user.id) &&
      (this.previousChancellor === null || this.previousChancellor.id !== user.id)
  }

  isInvestigated (user) {
    return this._findPlayer(user).isInvestigated
  }

  passPresidentPlacard () {
    do {
      this.presidentPlacard = (this.presidentPlacard + 1) % this.players.length
    } while (!this.isAlive(this.getPresidentialCandidate()))
  }

  nominateChancellor (user) {
    this.state = State.ELECTION_VOTE
    this.chancellorCandidate = user
  }

  voteGovernment (votes) {
    if (votes.reduce((acc, curr) => curr === Vote.YES ? acc + 1 : acc - 1, 0) > 0) {
      this.previousPresident = this.getPresidentialCandidate()
      this.previousChancellor = this.chancellorCandidate
      this.failedGovernmentsCount = 0
      this.state = State.LEGISLATIVE_SESSION
      return ElectionResult.PASSED
    } else if (++this.failedGovernmentsCount === 3) {
      this.previousPresident = null
      this.previousChancellor = null
      this.failedGovernmentsCount = 0
      this.state = State.ELECTION
      return ElectionResult.ANARCHY
    } else {
      this.passPresidentPlacard()
      this.state = State.ELECTION
      return ElectionResult.FAILED
    }
  }

  drawPolicies (count) {
    return this.policyDeck.splice(0, count)
  }

  peekPolicies (count) {
    return this.policyDeck.slice(0, count)
  }

  enactPolicy (policy, anarchy) {
    const {
      POLICY_PEEK,
      INVESTIGATE_LOYALTY,
      SPECIAL_ELECTION,
      EXECUTION,
      VETO_POWER
    } = ExecutivePower

    switch (policy) {
      case Policy.LIBERAL:
        ++this.passedLiberalPoliciesCount
        this.passPresidentPlacard()
        this.state = State.ELECTION
        return []
      case Policy.FACIST:
        ++this.passedFacistPoliciesCount
        let executivePowers
        if (this.players.length <= 6) {
          executivePowers = ({
            1: [],
            2: [],
            3: [ POLICY_PEEK ],
            4: [ EXECUTION ],
            5: [ EXECUTION, VETO_POWER ]
          })[this.passedFacistPoliciesCount]
        } else if (this.players.length <= 8) {
          executivePowers = ({
            1: [],
            2: [ INVESTIGATE_LOYALTY ],
            3: [ SPECIAL_ELECTION ],
            4: [ EXECUTION ],
            5: [ EXECUTION, VETO_POWER ]
          })[this.passedFacistPoliciesCount]
        } else {
          executivePowers = ({
            1: [ INVESTIGATE_LOYALTY ],
            2: [ INVESTIGATE_LOYALTY ],
            3: [ SPECIAL_ELECTION ],
            4: [ EXECUTION ],
            5: [ EXECUTION, VETO_POWER ]
          })[this.passedFacistPoliciesCount]
        }

        if (executivePowers.includes(INVESTIGATE_LOYALTY)) {
          this.executiveActionInPlay = INVESTIGATE_LOYALTY
          this.state = State.EXECUTIVE_ACTION
        } else if (executivePowers.includes(SPECIAL_ELECTION)) {
          this.executiveActionInPlay = SPECIAL_ELECTION
          this.state = State.EXECUTIVE_ACTION
        } else if (executivePowers.includes(EXECUTION)) {
          this.executiveActionInPlay = EXECUTION
          this.state = State.EXECUTIVE_ACTION
        } else {
          this.passPresidentPlacard()
          this.state = State.ELECTION
        }

        return executivePowers
    }
  }

  discardPolicies (policies) {
    this.discardDeck.push(...policies)
  }

  reshufflePolicies () {
    if (this.policyDeck.length < 3) {
      this.policyDeck = shuffle([ ...this.policyDeck, ...this.discardDeck ])
    }
  }

  investigate (user) {
    const player = this._findPlayer(user)
    player.isInvestigated = true
    this.passPresidentPlacard()
    this.state = State.ELECTION
    return player.role
  }

  execute (user) {
    const player = this._findPlayer(user)
    player.isAlive = false
    this.passPresidentPlacard()
    this.state = State.ELECTION
  }
}

module.exports.State = State
module.exports.Role = Role
module.exports.Vote = Vote
module.exports.ElectionResult = ElectionResult
module.exports.Policy = Policy
module.exports.ExecutivePower = ExecutivePower
