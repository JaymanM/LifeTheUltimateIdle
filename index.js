const defaultPlayer = function() {
  return {
    weeds: {
      current: 0,
      perSec: 0,
      lifetime: 0
    },
    money: {
      current: 100,
      perSec: 0,
      lifetime: 0
    },
    lawnmower: {
      selected: 'none',
      costs: [94, 98],
    },
    bills: {
      electricity: 0
    },
    job: {
      selected: 'none',
      salary: 0
    },
    has: {
      unlocked: {
        money: false,
        lawnmowers: false,
        jobs: false,
        gardeners: false
      }
    },
    action: {
      current: 'weeding'
    },
    workers: {
      gardeners: {
        max: 1,
        amount: 0,
        salary: {
          prev: 0,
          current: 0
        },
        weedsPS: 0
      }
    }
  }
}

const game = {
  load: () => JSON.parse(localStorage.getItem("save")) ?? defaultPlayer(),
  save: (data) => localStorage.setItem("save", JSON.stringify(data)),
  reset: () => localStorage.removeItem("save")
}

if (confirm("Due to the P.O.C 2 update, I would strongly recommend hard resetting if this is your first time loading up after the update as the state is not the same as the previous P.O.C, causing lots of errors. Would you like to hard reset? NOTE: If you have already hard reset since the release of P.O.C 2, just choose CANCEL.")) {
  game.reset();
}

const store = new Vuex.Store({
  state: game.load(),
  getters: {
    currentWeed: state => state.weeds.current,
    weedPerSec: state => state.weeds.perSec,
    currentMoney: state => state.money.current,
    moneyPerSec: state => state.money.perSec,
    currentLawnmower: state => state.lawnmower.selected,
    currentJob: state => state.job.selected,
    currentSalary: state => state.job.salary,
    currentBills: state => {
      return {
        electricity: state.bills.electricity
      }
    },
    currentMaxGardeners: state => state.workers.gardeners.max,
    currentGardeners: state => state.workers.gardeners.amount,
    currentGardenerSalary: state => state.workers.gardeners.salary.current,
    previousGardenerSalary: state => state.workers.gardeners.salary.prev,
    totalGardenerWeedGainPerc: state => state.workers.gardeners.weedsPS,
    currentAction: state => state.action.current,
    costs: state => {
      return {
        corded: state.lawnmower.costs[0],
        cordless: state.lawnmower.costs[1]
      }
    },
    unlocks: state => {
      return {
        money: state.has.unlocked.money,
        lawnmowers: state.has.unlocked.lawnmowers,
        jobs: state.has.unlocked.jobs,
        gardeners: state.has.unlocked.gardeners
      }
    }
  },
  mutations: {
    INCREMENT_WEEDS: (state, payload) => {
      state.weeds.current += payload;
      if (state.weeds.current >= 10) {
        state.has.unlocked.money = true;
      }
      if (state.weeds.current >= 20) {
        state.has.unlocked.lawnmowers = true;
      }
      if (state.weeds.current >= 40) {
        state.has.unlocked.jobs = true;
      }
      if (state.weeds.current >= 100) {
        state.has.unlocked.gardeners = true;
      }
    },
    DECREMENT_WEEDS: (state, payload) => {
      state.weeds.current -= payload;
    },
    INCREMENT_WPS: (state, payload) => {
      state.weeds.perSec += payload;
    },
    SET_WPS: (state, payload) => {
      state.weeds.perSec = payload;
    },
    DECREMENT_WPS: (state, payload) => {
      state.weeds.perSec -= payload;
    },
    SET_SALARY: (state, payload) => {
      state.job.salary = payload;
    },
    INCREMENT_GMAX: (state, payload) => state.workers.gardeners.max += payload,
    DECREMENT_GMAX: (state, payload) => state.workers.gardeners.max -= payload,
    SET_GMAX: (state, payload) => state.workers.gardeners.max = payload,
    CHANGE_LAWNMOWER_TYPE: (state, payload) => state.lawnmower.selected = payload,
    CHANGE_JOB: (state, payload) => state.job.selected = payload,
    INCREMENT_MONEY: (state, payload) => state.money.current += payload,
    INCREMENT_MPS: (state, payload) => state.money.perSec += payload,
    SET_MPS: (state, payload) => state.money.perSec = payload,
    DECREMENT_MPS: (state, payload) => state.money.perSec -= payload,
    INCREMENT_BILLS: (state, payload) => state.bills.electricity += payload,
    DECREMENT_MONEY: (state, payload) => state.money.current -= payload,
    SET_ACTION: (state, payload) => state.action.current = payload,
    INCREMENT_GARDENERS: (state, payload) => state.workers.gardeners.amount += payload,
    DECREMENT_GARDENERS: (state, payload) => state.workers.gardeners.amount -= payload,
    SET_GARDENERS: (state, payload) => state.workers.gardeners.amount = payload,
    INCREMENT_GWPS: (state, payload) => state.workers.gardeners.weedsPS += payload,
    DECREMENT_GWPS: (state, payload) => state.workers.gardeners.weedsPS -= payload,
    SET_GWPS: (state, payload) => state.workers.gardeners.weedsPS = payload,
    INCREMENT_GSALARY: (state, payload) => state.workers.gardeners.salary.current += payload,
    DECREMENT_GSALARY: (state, payload) => state.workers.gardeners.salary.current -= payload,
    SET_GSALARY: (state, payload) => state.workers.gardeners.salary.current = payload,
    SET_PREVGSALARY: (state, payload) => state.workers.gardeners.salary.prev = payload
  }
});

const app = new Vue({
  el: "#app",
  store,
  data() {
    return {
      ver: "P.O.C 2",
      intervals: {
        save: setInterval(() => this.save(store.state), 10000)
      },
      refs: {
        time: 0,
        req: requestAnimationFrame(this.tick)
      },
      lawnmowerType: {
        corded: {
          name: "Lawn Destroyer 3000",
          cost: 94,
          bills: {
            electricity: 25
          },
          baseWeedsPS: 2,
          info: "Due to it's light weight, this lawnmower will be able to pull 2x the weeds. However, due to it's higher voltages, it consumes more electricity, increasing electricity bills."
        },
        cordless: {
          name: "Yard Demolisher V1.0",
          cost: 98,
          bills: {
            electricity: 17
          },
          baseWeedsPS: 1,
          info: "The battery in this bad boy is heavy, causing pulling weeds to be slower. However, you don't need to spend as much on electricity as it uses lower voltages!"
        }
      },
      jobType: {
        internship: {
          position: "intern",
          salary: {
            base: 160,
            current: this.salary
          },
          info: "As an intern, you are motivated by your mentor, improving your weed pulling rate by 25%."
        },
        garbageMan: {
          position: "garbage man",
          salary: {
            base: 220,
            current: this.salary
          },
          info: "As a garbage man, you inhale smelly items all day long, making you sick. This causes your weed pulling rate to decrease by 30%."
        }
      },
      gardeners: {
        base: [30],
        names: ["Sandy the weeder"]
      }
    }
  },
  computed: {
    ...Vuex.mapGetters({
      weeds: "currentWeed",
      weedsPS: "weedPerSec",
      money: "currentMoney",
      moneyPS: "moneyPerSec",
      lawnmower: "currentLawnmower",
      job: "currentJob",
      unlocked: "unlocks",
      costs: "costs",
      salary: "currentSalary",
      bills: "currentBills",
      action: "currentAction",
      gardenerAmt: "currentGardeners",
      gardenerSalary: "currentGardenerSalary",
      maxGardeners: "currentMaxGardeners",
      prevGardenerSalary: "previousGardenerSalary",
      gardenerWeedsPS: "totalGardenerWeedGainPerc"
    })
  },
  methods: {
    ...Vuex.mapMutations({
      obtainWeeds: "INCREMENT_WEEDS",
      deductWeeds: "DECREMENT_WEEDS",
      obtainWPS: "INCREMENT_WPS",
      setWPS: "SET_WPS",
      deductWPS: "DECREMENT_WPS",
      obtainMoney: "INCREMENT_MONEY",
      obtainMPS: "INCREMENT_MPS",
      setMPS: "SET_MONEY",
      setSalary: "SET_SALARY",
      deductMPS: "DECREMENT_MPS",
      deductMoney: "DECREMENT_MONEY",
      changeLawnmower: "CHANGE_LAWNMOWER_TYPE",
      changeJob: "CHANGE_JOB",
      obtainElectBills: "INCREMENT_BILLS",
      setAction: "SET_ACTION",
      hireGardeners: "INCREMENT_GARDENERS",
      fireGardeners: "DECREMENT_GARDENERS",
      setGardeners: "SET_GARDENERS",
      obtainGardenerWPS: "INCREMENT_GWPS",
      deductGardenerWPS: "DECREMENT_GWPS",
      setGardenerWPS: "SET_GWPS",
      raiseGardenerSalary: "INCREMENT_GSALARY",
      lowerGardenerSalary: "DECREMENT_GSALARY",
      setGardenerSalary: "SET_GSALARY",
      raiseGardenerMax: "INCREMENT_GMAX",
      lowerGardenerMax: "DECREMENT_GMAX",
      setGardenerMax: "SET_GMAX",
      setPrevGardenerSalary: "SET_PREVGSALARY"
    }),
    load: game.load,
    save: game.save,
    tick(timeTaken) {
      const deltaTime = timeTaken - this.refs.time;
      this.obtainWeeds((this.action === 'weeding' ? this.getTotalWeedGain() : this.getTotalGardenerWeedGain()) * (deltaTime / 1000));
      this.obtainMoney(this.getTotalMoneyGain() * (deltaTime / 1000));
      this.refs.time = timeTaken;
      this.refs.req = requestAnimationFrame(this.tick);
    },
    formatWeedGain() { return this.getTotalWeedGain() >= 0 && this.getTotalWeedGain() < 0.1 ? this.getTotalWeedGain().toFixed(0) : this.getTotalWeedGain().toFixed(1); },
    formatGardenerWeedGain() { return this.getTotalGardenerWeedGain() >= 0 && this.getTotalGardenerWeedGain() < 0.1 ? this.getTotalGardenerWeedGain().toFixed(0) : this.getTotalGardenerWeedGain().toFixed(1); },
    getTotalWeedGain() {
      if (this.action !== 'weeding') return 0;

      let total;
      total = this.weedsPS;
      if (this.money < 0) total = total / 2;
      if (this.job === 'internship') total = total * 1.25;
      else if (this.job === 'garbageMan') total = total * 0.7;
      return total;
    },
    getTotalGardenerWeedGain() { return this.action === 'working' ? this.gardenerWeedsPS : 0; },
    getTotalMoneyGain() { return (this.action === 'working' ? this.moneyPS : 0) - (this.action === 'working' ? this.prevGardenerSalary / 60 / 60 : 0) - (this.action === 'weeding' ? this.bills.electricity / 60 / 60 : 0); },
    pullWeed() {
      this.obtainWeeds(1);
    },
    chooseLawnmower(obj, type, index) {
      this.changeLawnmower(Object.keys(obj)[index]);
      this.deductMoney(obj[type].cost);
      this.obtainElectBills(obj[type].bills.electricity);
      this.obtainWPS(obj[type].baseWeedsPS);
    },
    chooseJob(obj, type, index) {
      this.changeJob(Object.keys(obj)[index]);
      this.setSalary(obj[type].salary.base);
      this.obtainMPS(this.salary / 60 / 60);
    },
    switchAction() {
      let actions = ['weeding', 'working']
      this.setAction((this.action == actions[0]) ? actions[1] : actions[0]);
    },
    hireGardener() {
      this.hireGardeners(1);
      this.setPrevGardenerSalary(this.gardeners.base[0]);
      this.setGardenerSalary(this.prevGardenerSalary * 1.05);
      this.obtainGardenerWPS(0.2);
    },
    raiseGardenerSalary() {
      this.setPrevGardenerSalary(this.gardenerSalary);
      this.setGardenerSalary(this.prevGardenerSalary * 1.05);
      this.obtainGardenerWPS(0.2);
    }
  }
})
