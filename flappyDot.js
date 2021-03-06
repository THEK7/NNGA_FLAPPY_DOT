//globalne varijable
var birds = [];
var deadBirds = [];
var pipes = [];
var GA = new GeneticAlgorithm(40, 20);

var bodovi = 0;
var udaljenost = 0;
var put = 0;
var najboljiPut = 0;

//metoda koja postavlja okolinu i likove
function setup() {
    createCanvas(window.innerWidth-150, window.innerHeight - 200);

    for (var i = 0; i < GA.broj_ptica; i++) {
        birds.push(new Bird(i));
    }
    pipes.push(new Pipe(width, random(height * 0.3, height * 0.7), color('green')));
    cijevIspred = pipes[0];
    GA.stvoriPopulaciju();
}

//metoda koja crta okolinu i likove
function draw() {
    background(255);
    
    if (frameCount % 100 === 0) {
        pipes.push(new Pipe(width, random(height * 0.3, height * 0.7), color('green')));
    }

    for (var i = 0; i < pipes.length; i++) {
        pipes[i].update();
        pipes[i].draw();
        if (pipes[i].x < -40) {
            pipes.shift();
            bodovi += 1;
            cijevIspred = pipes[0];
        }
    }

    for (var b = 0; b < birds.length; b++) {
        cijevIspred = pipes[0];
        put += 3.5;
        udaljenost += Math.abs(cijevIspred.x);
        birds[b].update();
        birds[b].draw();
        GA.reagiraj(birds[b], cijevIspred);
        birds[b].trenutna_spremnost += udaljenost - (cijevIspred.x - birds[b].x);
        birds[b].trenutni_bodovi = bodovi;
      
        if (birds[b].x > cijevIspred.x + 60) {
            cijevIspred = pipes[1];         
        }
        if(birds[b].y - 10 < 0 || birds[b].y + 10 > height || birds[b].sudar(cijevIspred)){
            GA.populacija[birds[b].index].spremnost = birds[b].trenutna_spremnost;
            GA.populacija[birds[b].index].bodovi = birds[b].trenutni_bodovi;
            deadBirds.push(birds[b]);
            birds.splice(b, 1);     
        }
        if(birds.length == 0){
            GA.evolucija();
            GA.iteracija += 1;
            if (put > najboljiPut) najboljiPut = put;
            bodovi = 0;
            put = 0;
            udaljenost = 0;
            pipes.splice(0, pipes.length -1);
            deadBirds.sort(function(a, b){
                return a.index-b.index;
            });
            for(var j = 0; j < deadBirds.length; j++){
                birds.push(new Bird(j));
                birds[j].prethodna_spremnost = deadBirds[j].trenutna_spremnost;
                birds[j].prethodna_bodovi = deadBirds[j].trenutni_bodovi;
            }
            deadBirds = [];
        }      
    }
    textSize(50);
    text(bodovi, width/2, height - 50);
    textSize(15);
    text("žive: " + birds.length, 20, height - 80);
    text("najdulji put: " + najboljiPut, 20, height - 60);
    text("najbolji bodovi: " + GA.najbolji_bodovi, 20, height - 40);
    text("GENERACIJA: " + GA.iteracija, 20, height - 20);
}


