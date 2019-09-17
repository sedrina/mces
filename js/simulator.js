

class Simulator {
    constructor(team1, team2, count, time_limit) {
        this.team1 = team1;
        this.team2 = team2;
        this.count = count;
        this.time_limit = time_limit;
        this.results = [];
    }

    start() {
        console.log('start simulation....', this.count , this.time_limit);
        for ( let i = 0 ; i < this.count ; i++ ) {
            this._simulate_arena();
        }
        let winners = [0, 0, 0, 0];
        let time_elapsed = 0;
        this.results.forEach(r => {
            time_elapsed += r.duration;
            winners[r.winner]++;
        });
        time_elapsed = Math.floor(time_elapsed / this.results.length);
        let msg = 'Avrg Battle Time:' + time_elapsed + 'seconds. Team 1 Wins:'+ winners[1] +
            ' Team 2 Wins:' + winners[2] + ' Draws:' + winners[3];
        console.log('RESULT', msg);
        return msg;
    }

    _simulate_arena() {
        let t0 = shuffle(this._create_team(1, this.team1));
        let t1 = shuffle(this._create_team(2, this.team2));
        let order = Math.random() > 0.5;
        let heroes = order ? t0.concat(t1) : t1.concat(t0);
        let arena = new Arena(heroes, this.time_limit);
        let result = arena.run();
        this.results.push(result);
    }

    _create_team(team_id, members) {
        let team = [];
        for ( let i in members ) {
            let name = members[i];
            let data = HEROES[name];
            let hero = new Hero(name, team_id, data);
            team.push(hero);
        }
        return team;
    }
}