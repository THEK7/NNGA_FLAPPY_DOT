// Implementacija genetskog algoritma

function GeneticAlgorithm(broj_ptica, najbolje_ptice) {
    this.broj_ptica = broj_ptica; // broj ptica u populaciji
    this.najbolje_ptice = najbolje_ptice; // najbolje ptice u populaciji (koriste se za unaprijeđenje iduće populacije)

    this.iteracija = 1; // jednako je trenutnom broju iteracije
    this.mutacijaRating = 1;

    this.najbolja_spremnost = 0; // najbolja spremnost ptice
    this.najbolji_bodovi = 0; // score najbolje ptice

    if(this.broj_ptica < this.najbolje_ptice) this.broj_ptica = this.najbolje_ptice;

    this.populacija = []; // niz svih ptica u populaciji
}


GeneticAlgorithm.prototype.stvoriPopulaciju = function() {
    // očisti neku postojeću populaciju
    this.populacija.splice(0, this.populacija.length);

    for (var i=0; i<this.broj_ptica; i++) {
        // stvori novu pticu generiranjem ranomd Synaptic neuronske mreže
        // sa 2 neurona u ulaznom, 6 neurona u skrivenom te 1 neuronu u izlaznom layeru
        var novaJedinica = new synaptic.Architect.Perceptron(2, 6, 1);

        // dodatni parametri za novu jedinicu
        novaJedinica.index = i;
        novaJedinica.spremnost = 0;
        novaJedinica.bodovi = 0;
        novaJedinica.jePobjednik = false;

        // dodaj novu jedinicu u populaciju
        this.populacija.push(novaJedinica);
    }
};

GeneticAlgorithm.prototype.reagiraj = function(ptica, pipe) {
    // ulaz 1: horizontalna udaljenost između ptice i pipe-a
    var horizontaloX = pipe.x - 50;
    // ulaz 2: razlika u visini između ptice i sredine između pipe-ova
    var razlikaVisina = pipe.y - ptica.y;

    // niz svih ulaza
    var ulazi = [horizontaloX, razlikaVisina];

    // izračunaj izlaz aktivirajući synaptic neural network za pticu
    var izlaz = this.populacija[ptica.index].activate(ulazi);

    // napravi clap ako je izlaz veći od 0.5
    if(izlaz[0] > 0.5) ptica.clap(-8);
};

// metoda za selekciju
GeneticAlgorithm.prototype.selekcija = function () {
    // sortirati jedinice trenutne populacije u silazećem poretku po spremnosti
    var sortiranaPopulacija = this.populacija.sort(
        function (unitA, unitB) {
            return unitB.spremnost - unitA.spremnost;
        }
    );

    for (var i = 0; i < this.najbolje_ptice; i++) this.populacija[i].jePobjednik = true;

    return sortiranaPopulacija.slice(0, this.najbolje_ptice);
};


GeneticAlgorithm.prototype.crossOver = function (roditeljA, roditeljB) {
    var cutPoint = round(random(0, roditeljA.neurons.length - 1));
    // zamijeni informaciju između dva roditelja
    // 1. lijeva strana je kopirana od jednog roditelja
    // 2. desna strana poslje crossovera je kopirana od drugog roditelja
    for (var i = cutPoint; i < roditeljA.neurons.length; i++) {
        var biasRoditeljaA = roditeljA.neurons[i].bias;
        roditeljA.neurons[i].bias = roditeljB.neurons[i].bias;
        roditeljB.neurons[i].bias = biasRoditeljaA;
    }

    return random(0, 1) == 1 ? roditeljA : roditeljB;
};

GeneticAlgorithm.prototype.mutacija = function (potomak) {
    // mutiraj bias informacije potomkovih neurona

    for (var i = 0; i < potomak.neurons.length; i++) {
        potomak.neurons[i].bias = this.mutiraj(potomak.neurons[i].bias);
    }

    for (var j = 0; j < potomak.connections.length; j++) {
        potomak.connections[j].weight = this.mutiraj(potomak.connections[j].weight);
    }
    return potomak;
};

GeneticAlgorithm.prototype.mutiraj = function (gen) {
    if (Math.random() <= this.mutacijaRating) {
        var mutacijaFaktor = 1 + ((Math.random() - 0.5) * 3 + (Math.random() - 0.5));
        gen *= mutacijaFaktor;
    }

    return gen;
};

GeneticAlgorithm.prototype.dohvatiNasumicno = function (array) {
    return array[round(random(0, array.length - 1))];
};




// evolucija nad populacijom vrši se po selekciji, križanju i mutaciju jedinica
GeneticAlgorithm.prototype.evolucija = function() {
    // odaberi top jedinice trenutne populacije
    // bit će kopirane u iduću populaciju
    var pobjednici = this.selekcija();

    if(this.mutacijaRating == 1 && pobjednici[0].bodovi == 0) {
        this.stvoriPopulaciju();
    }
    else{
        this.mutacijaRating = 0.4;
    }

    for(var i= this.najbolje_ptice; i<this.broj_ptica; i++){
        var roditeljA, roditeljB, potomak;

        if(i == this.najbolje_ptice){
            roditeljA = pobjednici[0].toJSON();
            roditeljB = pobjednici[1].toJSON();
            potomak = this.crossOver(roditeljA, roditeljB);
        }
        else if(i < this.broj_ptica-2){
            roditeljA = this.dohvatiNasumicno(pobjednici).toJSON();
            roditeljB = this.dohvatiNasumicno(pobjednici).toJSON();
            potomak = this.crossOver(roditeljA, roditeljB);
        }
        else{
            potomak = this.dohvatiNasumicno(pobjednici).toJSON();
            potomak = this.mutacija(potomak);
        }

        var novaJedinica = synaptic.Network.fromJSON(potomak);
        novaJedinica.index = this.populacija[i].index;
        novaJedinica.spremnost = 0;
        novaJedinica.bodovi = 0;
        novaJedinica.jePobjednik = false;

        this.populacija[i] = novaJedinica;
    }

    if(pobjednici[0].spremnost > this.najbolja_spremnost) {
        this.najbolja_populacija = this.iteracija;
        this.najbolja_spremnost = pobjednici[0].spremnost;
        this.najbolji_bodovi = pobjednici[0].bodovi;
    }

    this.populacija.sort(function(jedinicaA, jedinicaB){
        return jedinicaA.index - jedinicaB.index;
    });
};

