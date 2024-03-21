/**
 * @type { HTMLCanvasElement }
*/
var scene = document.getElementById("scene");
var ctx = scene.getContext("2d");

var vWidth = window.innerWidth;
var vHeight = window.innerHeight;

var updateIdx = 999;
var tFps = 60;
var paused = true;

var keysDown = [];

var cellATP = 0;
var cellIsDead = false;

var mouse = {
    prevX: 0,
    prevY: 0,
    x: 0,
    y: 0,
    snapX: 0,
    snapY: 0,
    down: false,
    rightdown: false
}

function resizeCanvas() {
    vWidth = window.innerWidth;
    vHeight = window.innerHeight;
    scene.width = vWidth;
    scene.height = vHeight;
}

resizeCanvas();

function random(min, max) {
    return (Math.random() * (max - min)) + min;
}

var degToRad = Math.PI / 180;

var radToDeg = 180 / Math.PI;

class Question {
    constructor(question = "", answer = "", multChoiceAnswers = []) {
        this.question = question;
        this.answer = answer;
        this.answered = false;
        this.multChoiceAnswers = multChoiceAnswers;
    }
}

class QuestionSet {
    constructor(questions = []) {
        this.questions = questions;
        this.activeQuestion = null;
        this.numCorrect = 0;
        this.currentQ = 0;
        this.next();
    }

    next() {
        for (var i = 0; i < this.questions.length; i++) {
            var question = this.questions[i];

            if (question.answered == false) {
                this.activeQuestion = question;
                this.currentQ++;
                return true;
            }

            if (i === this.questions.length - 1) {
                return false;
            }
        }
    }

    checkAnswer(answer) {
        if (this.activeQuestion.answered == false) {
            this.activeQuestion.answered = true;
            if (answer === this.activeQuestion.answer) {
                this.numCorrect++;
                cellATP += 2;
                return true;
            }

            return false;
        }
    }

    reset() {
        this.currentQ = 0;
        this.numCorrect = 0;

        for (var i = 0; i < this.questions.length; i++) {
            var question = this.questions[i];

            question.answered = false;

            question.multChoiceAnswers.sort(() => {
                return Math.random() - 0.5;
            });
        }

        this.questions.sort(() => {
            return Math.random() - 0.5;
        });

        this.next();
    }
}

var easyQuestions = [
    new Question("Where is a eukaryotic cell's DNA stored?", "The Nucleus", ["The Cytoplasm", "The Nucleus", "The Centrioles", "The Central Vacuole"]),
    new Question("Which of these organelle(s) do animal cells NOT contain?", "Chloroplasts", ["Mitochondria", "The Golgi Apparatus", "The Vesicles", "Chloroplasts"]),
    new Question("True or False: All cells have a cell wall.", "False", ["True", "False"]),
    new Question("True or False: Prokaryotic cells have a nucleus.", "False", ["True", "False"]),
    new Question("Where is a prokaryotic cell's DNA stored?", "The Cytoplasm", ["The Cytoplasm", "The Nucleus", "The Cell Membrane", "The Ribosomes"]),
    new Question("What is produced after the result of photosynthesis?", "1 Glucose and 6 Oxygen", ["1 Glucose and 6 Oxygen", "6 Glucose and 1 Oxygen", "1 Glucose and 3 Oxygen", "1 Glucose and 6 Carbon Dioxide"]),
    new Question("True or False: The cell membrane is described by the fluid mosaic model.", "True", ["True", "False"]),
    new Question("Which organelle modifies packages and distributes proteins?", "The Golgi Apparatus", ["The Golgi Apparatus", "The Ribosomes", "The Vesicles", "None Of The Above"]),
    new Question("Organisms that make their own food are called:", "Autotrophs", ["Heterotrophs", "Autotrophs"]),
    new Question("Which organelle creates proteins?", "The Ribosomes", ["The Ribosomes", "The Golgi Apparatus", "The Vesicles", "The Centrioles"]),
    new Question("True or False: All cells make ATP through cellular respiration.", "True", ["True", "False"]),
    new Question("True or False: All cells make their own food.", "False", ["True", "False"]),
    new Question("Which organelle is responsible for most of the process of cellular respiration in eukaryotic cells?", "The Mitochondria", ["The Mitochondria", "The Golgi Apparatus", "The Cytoplasm", "The Centrioles"]),
    new Question("Biology is:", "The Study of Life", ["The Study of Life", "The Study of Organelles", "The Study of Cells and Their Function", "The Study of Eukaryotes"]),
    new Question("What is produced after the result of cellular respiration?", "6 Carbon Dioxide and 6 Water", ["6 Carbon Dioxide and 6 Water", "6 Oxygen and 6 Water", "3 Carbon Dioxide and 6 Water", "6 Carbon Dioxide and 5 Water"]),
    new Question('What organelle is known as "The powerhouse of the cell" in eukaryotic cells?', "The Mitochondria", ["The Mitochondria", "The Nucleus", "The Golgi Apparatus", "The Endoplasmic Reticulum"]),
    new Question("Which molecule stores genetic information in a eukaryotic cell?", "DNA", ["DNA", "RNA", "Protein", "Carbohydrate"]),
    new Question("What is the process by which cells break down glucose to release energy?", "Cellular Respiration", ["Photosynthesis", "Cellular Respiration", "Fermentation", "Glycolysis"]),
    new Question("True or False: Mitochondria are only found in animal cells.", "False", ["True", "False"]),
    new Question("True or False: Chloroplasts are responsible for cellular respiration in plant cells.", "False", ["True", "False"]),
    new Question("True or False: The lysosome is responsible for breaking down cellular waste material.", "True", ["True", "False"]),
    new Question("True or False: The endoplasmic reticulum is composed of two types, rough and smooth.", "True", ["True", "False"]),
    new Question("True or False: Osmosis is the movement of water from an area of lower concentration to an area of higher concentration.", "False", ["True", "False"]),
    new Question("True or False: The cell wall is found in animal cells but not in plant cells.", "False", ["True", "False"]),
    new Question("True or False: The nucleus of a cell contains DNA in the form of chromosomes.", "True", ["True", "False"])
];

var questionSet = new QuestionSet(easyQuestions);

var openedMenuHierarchy = [
    ["how-to-menu", "flex"],
    ["question-container", "flex"],
    ["nothing-opened", "none"],
    ["main-menu", "flex"]
];

function updateMenuDisplay() {
    for (var i = 0; i < openedMenuHierarchy.length; i++) {
        var cMenu = openedMenuHierarchy[i];

        if (cMenu[0] === "nothing-opened") {
            continue;
        }

        if (i === openedMenuHierarchy.length - 1) {
            document.getElementById(cMenu[0]).style.display = cMenu[1];
        } else {
            document.getElementById(cMenu[0]).style.display = "none";
        }
    }
}

function openMenu(menuName) {
    // debugger;
    for (var i = 0; i < openedMenuHierarchy.length - 1; i++) {
        var cMenu = openedMenuHierarchy[i];

        if (cMenu[0] === menuName) {
            var nMenu = openedMenuHierarchy.splice(i, 1);
            openedMenuHierarchy.push(cMenu);
            break;
        }
    }

    updateMenuDisplay();
}

function closeTopMenu() {
    if (openedMenuHierarchy[openedMenuHierarchy.length - 1][0] === "nothing-opened") {
        return;
    }

    var wasOpened = openedMenuHierarchy.pop();
    openedMenuHierarchy.unshift(wasOpened);
    updateMenuDisplay();
}

function closeAllMenus() {
    while (openedMenuHierarchy[openedMenuHierarchy.length - 1][0] !== "nothing-opened") {
        closeTopMenu();
    }
}

updateMenuDisplay();

var currentlySelectedRadioBtn = 0;

var playbtn = document.getElementById("play-button");
var questBox = document.getElementById("question-container");
var nxtQuestBtn = document.getElementById("next-question-btn");
var htpBtn = document.getElementById("htp-button");
var htpBtn2 = document.getElementById("htp-button-2");
var replayGameBtn = document.getElementById("reset-game");

/**
 * @type { HTMLInputElement }
 */
var radioBtn1 = document.getElementById("radio-btn-1");
var radioBtn2 = document.getElementById("radio-btn-2");
var radioBtn3 = document.getElementById("radio-btn-3");
var radioBtn4 = document.getElementById("radio-btn-4");

function updateRadioButtons() {
    radioBtn1.disabled = true;
    radioBtn2.disabled = true;
    radioBtn3.disabled = true;
    radioBtn4.disabled = true;
    radioBtn1.checked = false;
    radioBtn2.checked = false;
    radioBtn3.checked = false;
    radioBtn4.checked = false;
    nxtQuestBtn.style.display = "inline-block";
    document.getElementById(radioBtn1.id + "-label").innerText = "";
    document.getElementById(radioBtn2.id + "-label").innerText = "";
    document.getElementById(radioBtn3.id + "-label").innerText = "";
    document.getElementById(radioBtn4.id + "-label").innerText = "";

    document.getElementById("q-number").innerText = "Question " + questionSet.currentQ + ":";
    document.getElementById("question-display").innerText = questionSet.activeQuestion.question;
    for (var i = 0; i < questionSet.activeQuestion.multChoiceAnswers.length; i++) {
        var rdElem = document.getElementById("radio-btn-" + (i + 1));

        rdElem.disabled = false;
        rdElem.value = questionSet.activeQuestion.multChoiceAnswers[i];
        document.getElementById(rdElem.id + "-label").innerText = questionSet.activeQuestion.multChoiceAnswers[i];
    }
}

updateRadioButtons();

radioBtn1.onclick = function () {
    currentlySelectedRadioBtn = 1;
}

radioBtn2.onclick = function () {
    currentlySelectedRadioBtn = 2;
}

radioBtn3.onclick = function () {
    currentlySelectedRadioBtn = 3;
}

radioBtn4.onclick = function () {
    currentlySelectedRadioBtn = 4;
}

function calculateGradeFromPercent(percent) {
    if (percent >= 93) {
        return "A";
    }

    if (percent >= 83) {
        return "B";
    }

    if (percent >= 73) {
        return "C";
    }

    if (percent >= 65) {
        return "D";
    }

    return "F";
}

function displayGameEnd() {
    radioBtn1.disabled = true;
    radioBtn2.disabled = true;
    radioBtn3.disabled = true;
    radioBtn4.disabled = true;
    radioBtn1.checked = false;
    radioBtn2.checked = false;
    radioBtn3.checked = false;
    radioBtn4.checked = false;
    document.getElementById(radioBtn1.id + "-label").innerText = "";
    document.getElementById(radioBtn2.id + "-label").innerText = "";
    document.getElementById(radioBtn3.id + "-label").innerText = "";
    document.getElementById(radioBtn4.id + "-label").innerText = "";
    document.getElementById("q-number").innerText = cellIsDead == false ? "You Win!" : "You Lose!";
    var score = Math.round((questionSet.numCorrect / questionSet.questions.length) * 100);
    document.getElementById("question-display").innerText = "Your Question Accuracy (Grade): " + score + "%" + " (" + calculateGradeFromPercent(score) + ")";
    nxtQuestBtn.style.display = "none";
    cellIsDead = true;
}

nxtQuestBtn.onclick = function () {
    if (currentlySelectedRadioBtn === 0) {
        alert("Select An Answer.");
        return;
    }

    var answer = document.getElementById("radio-btn-" + currentlySelectedRadioBtn).value;

    questionSet.checkAnswer(answer);

    var nextQ = questionSet.next();

    if (nextQ == false) {
        displayGameEnd();
        return;
    }

    currentlySelectedRadioBtn = 0;
    updateRadioButtons();
}

playbtn.onclick = function () {
    questionSet.reset();
    closeAllMenus();
    paused = false;
    openMenu("question-container");
    updateRadioButtons();
}

var closebtns = [...document.getElementsByClassName("close-menu-btn")];

closebtns.forEach((btn) => {
    btn.onclick = function () {
        closeTopMenu();
    }
});

htpBtn.onclick = function () {
    openMenu("how-to-menu");
}

htpBtn2.onclick = function () {
    openMenu("how-to-menu");
}

function distanceToPointFromLine(point, line) {
    var x0 = point.x;
    var y0 = point.y;
    var x1 = line.pointA.position.x;
    var y1 = line.pointA.position.y;
    var x2 = line.pointB.position.x;
    var y2 = line.pointB.position.y;

    // Calculate coefficients of the line equation (Ax + By + C = 0)
    var A = y2 - y1;
    var B = x1 - x2;
    var C = x2 * y1 - x1 * y2;

    // Calculate the closest point on the line to the given point
    var xc = (B * (B * x0 - A * y0) - A * C) / (A * A + B * B);
    var yc = (A * (A * y0 - B * x0) - B * C) / (A * A + B * B);

    // Check if the closest point is within the line segment
    var d1 = Math.sqrt((xc - x1) ** 2 + (yc - y1) ** 2);
    var d2 = Math.sqrt((xc - x2) ** 2 + (yc - y2) ** 2);

    if (d1 <= Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) && d2 <= Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)) {
        // The closest point is within the line segment
        return Math.abs(A * x0 + B * y0 + C) / Math.sqrt(A ** 2 + B ** 2);
    }

    // Calculate the distance from the point to the line segment endpoints
    var dPA = Math.sqrt((x0 - x1) ** 2 + (y0 - y1) ** 2);
    var dPB = Math.sqrt((x0 - x2) ** 2 + (y0 - y2) ** 2);

    // Choose the minimum distance
    return Math.min(dPA, dPB);
}

function pointToCircleCollisionDetection(point, circle) {
    var dx = circle.x - point.x;
    var dy = circle.y - point.y;
    var dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < circle.radius) {
        return true;
    }

    return false;
}

class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    plusEquals(vector) {
        if (vector instanceof Vec2) {
            this.x += vector.x;
            this.y += vector.y;
            return;
        }

        this.x += vector;
        this.y += vector;
    }

    add(vector) {
        if (vector instanceof Vec2) {
            return new Vec2(this.x + vector.x, this.y + vector.y);
        }

        return new Vec2(this.x + vector, this.y + vector);
    }

    minusEquals(vector) {
        if (vector instanceof Vec2) {
            this.x -= vector.x;
            this.y -= vector.y;
            return;
        }

        this.x -= vector;
        this.y -= vector;
    }

    subtract(vector) {
        if (vector instanceof Vec2) {
            return new Vec2(this.x - vector.x, this.y - vector.y);
        }

        return new Vec2(this.x - vector, this.y - vector);
    }

    timesEquals(vector) {
        if (vector instanceof Vec2) {
            this.x *= vector.x;
            this.y *= vector.y;
            return;
        }

        this.x *= vector;
        this.y *= vector;
    }

    multiply(vector) {
        if (vector instanceof Vec2) {
            return new Vec2(this.x * vector.x, this.y * vector.y);
        }

        return new Vec2(this.x * vector, this.y * vector);
    }

    divideEquals(vector) {
        if (vector instanceof Vec2) {
            this.x /= vector.x;
            this.y /= vector.y;
            return;
        }

        this.x /= vector;
        this.y /= vector;
    }

    divide(vector) {
        if (vector instanceof Vec2) {
            return new Vec2(this.x / vector.x, this.y / vector.y);
        }

        return new Vec2(this.x / vector, this.y / vector);
    }

    dot(vector) {
        return (this.x * vector.x) + (this.y * vector.y);
    }

    length() {
        return Math.sqrt(this.dot(this));
    }

    normalized() {
        var mag = Math.sqrt(this.dot(this));
        return this.divide(mag);
    }

    direction() {
        return Math.atan2(this.y, this.x);
    }

    reflect(normal) {
        return this.subtract(normal.multiply(2 * this.dot(normal)));
    }
}

class Camera {
    constructor(x, y, viewScale) {
        this.x = x;
        this.y = y;
        this.viewScale = viewScale;
    }

    applyToCtx(context) {
        context.scale(this.viewScale, this.viewScale);
        context.translate(-(this.x - (context.canvas.width / (this.viewScale * 2))), -(this.y - (context.canvas.height / (this.viewScale * 2))));

        return {
            x: -(this.x - (context.canvas.width / (this.viewScale * 2))),
            y: -(this.y - (context.canvas.height / (this.viewScale * 2)))
        };
    }

    applyToMouse(context, mouseX, mouseY) {
        var translatedMouse = { x: mouseX, y: mouseY };
        translatedMouse.x = (mouseX + (this.x * this.viewScale) - (context.canvas.width / 2)) / this.viewScale;
        translatedMouse.y = (mouseY + (this.y * this.viewScale) - (context.canvas.height / 2)) / this.viewScale;

        return translatedMouse;
    }
}

var camera = new Camera(0, 0, 1);

var halfBoundsX = 2048;
var halfBoundsY = 2048;

class ConnectionPoint {
    constructor(x, y, locked = false) {
        this.position = new Vec2(x, y);
        this.prevPosition = new Vec2(x, y);
        this.velocity = new Vec2(0, 0);
        this.locked = locked;
        this.misc = null;
        // this.collisionSubsteps = 1024;
    }

    update() {
        if (this.locked == false) {
            var prevPos = this.position;
            this.velocity.plusEquals(this.position.subtract(this.prevPosition));
            this.velocity.plusEquals(gravityDir.multiply(gravity));

            var collisionSubsteps = (Math.ceil(Math.abs(this.velocity.x) + Math.abs(this.velocity.y)) + 1) * 2;
            // collisionSubsteps = 512;

            for (var i = 0; i < collisionSubsteps; i++) {
                this.position.x += this.velocity.x / collisionSubsteps;
                this.position.y += this.velocity.y / collisionSubsteps;

                if (this.checkAndResolveCollisions() === "break") {
                    break;
                }
            }

            this.prevPosition = prevPos;
        } else {
            this.velocity.timesEquals(0);
        }
    }

    checkAndResolveCollisions() {
        var brout = false;

        if (this.position.y > halfBoundsY) {
            this.position.y = halfBoundsY;
            this.velocity.y *= -0.1;
            this.velocity.x *= 0.9;
            brout = true;
        }

        if (this.position.y < -halfBoundsY) {
            this.position.y = -halfBoundsY;
            this.velocity.y *= -0.1;
            this.velocity.x *= 0.9;
            brout = true;
        }

        if (this.position.x > halfBoundsX) {
            this.position.x = halfBoundsX;
            this.velocity.x *= -0.1;
            this.velocity.y *= 0.9;
            brout = true;
        }

        if (this.position.x < -halfBoundsX) {
            this.position.x = -halfBoundsX;
            this.velocity.x *= -0.1;
            this.velocity.y *= 0.9;
            brout = true;
        }

        if (brout == true) {
            return "break";
        }

        return false;
    }

    draw(context, big = false) {
        context.save();
        context.fillStyle = this.locked == true ? "#ff8000" : "#ffffff";
        if (big == true) {
            context.beginPath();
            context.arc(this.position.x, this.position.y, 2, 0, 2 * Math.PI, false);
            context.fill();
            context.closePath();
        } else if (this.locked == true) {
            context.beginPath();
            context.arc(this.position.x, this.position.y, 1, 0, 2 * Math.PI, false);
            context.fill();
            context.closePath();
        }
        context.restore();
    }
}

class Connector {
    constructor(pointA, pointB, length, color = "#ffffff", calcLength = false) {
        this.pointA = pointA;
        this.pointB = pointB;
        this.length = length;
        if (calcLength == true) {
            this.length = pointB.position.subtract(pointA.position).length();
        }
        this.color = color;
    }

    update() {
        var lineCenter = (this.pointA.position.add(this.pointB.position)).multiply(0.5);
        var lineDir = (this.pointA.position.subtract(this.pointB.position)).normalized();

        var currentLength = (this.pointA.position.subtract(this.pointB.position));
        if (Math.abs(currentLength.x) <= 0.0001 && Math.abs(currentLength.y) <= 0.0001) {
            lineDir = new Vec2(Math.random() * 2 - 1, Math.random() * 2 - 1).normalized();
        }

        if (this.pointA.locked == false) {
            // var desiredPos = lineCenter.add(lineDir.multiply(this.length / 2));
            // var velToDP = desiredPos.subtract(this.pointA.position);
            this.pointA.position = lineCenter.add(lineDir.multiply(this.length / 2));
            // this.pointA.position = lineCenter.add(lineDir.multiply(this.length * 0.75));
            // this.pointA.velocity.plusEquals(velToDP.multiply(1));
        }

        if (this.pointB.locked == false) {
            // var desiredPos = lineCenter.subtract(lineDir.multiply(this.length / 2));
            // var velToDP = desiredPos.subtract(this.pointB.position);
            this.pointB.position = lineCenter.subtract(lineDir.multiply(this.length / 2));
            // this.pointB.position = lineCenter.subtract(lineDir.multiply(this.length * 0.75));
            // this.pointB.velocity.plusEquals(velToDP.multiply(1));
        }
    }

    draw(context) {
        context.save();
        context.strokeStyle = this.color;
        context.lineWidth = 2;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.beginPath();
        context.moveTo(this.pointA.position.x, this.pointA.position.y);
        context.lineTo(this.pointB.position.x, this.pointB.position.y);
        context.stroke();
        context.closePath();
        context.restore();
    }
}

var cPoints = [];
var cLines = [];

var numIterations = 32;

var gravity = 0;
var gravityDir = new Vec2(0, 1).normalized();

var startingSegments = 0;

function createCell(x, y, radius, segments) {
    if (segments === 0) {
        segments = 1;
    }

    segments = Math.ceil(segments);

    var currentAngle = 0;
    var angleIncrement = 360 / segments;
    for (var i = 0; i < segments; i++) {
        if (i === 0) {
            cPoints.push(new ConnectionPoint(Math.cos(currentAngle * degToRad) * radius, Math.sin(currentAngle * degToRad) * radius, false));
        } else {
            cPoints.push(new ConnectionPoint(Math.cos(currentAngle * degToRad) * radius, Math.sin(currentAngle * degToRad) * radius, false));
            cLines.push(new Connector(cPoints[i - 1], cPoints[i], cPoints[i].position.subtract(cPoints[i - 1].position).length(), "#0080ff"));

            if (i === segments - 1) {
                cLines.push(new Connector(cPoints[i - (segments - 1)], cPoints[i], cPoints[i].position.subtract(cPoints[i - (segments - 1)].position).length(), "#0080ff"));
            }
        }

        currentAngle += angleIncrement;
    }
}

createCell(0, 0, 256, 64);

startingSegments = cLines.length;

class Pathogen {
    constructor(x, y) {
        this.dead = false;
        this.cPoints = [
            new ConnectionPoint(x - 32, y - 16, false),
            new ConnectionPoint(x + 32, y - 16, false),
            new ConnectionPoint(x + 32, y + 16, false),
            new ConnectionPoint(x - 32, y + 16, false),
            new ConnectionPoint(x + 64, y - 32, false),
            new ConnectionPoint(x + 64, y + 32, false),
            new ConnectionPoint(x + 32, y, false)
        ];
        this.cLines = [
            new Connector(this.cPoints[0], this.cPoints[1], 64, "#ff0000", true),
            new Connector(this.cPoints[1], this.cPoints[6], 64, "#ff0000", true),
            new Connector(this.cPoints[6], this.cPoints[2], 64, "#ff0000", true),
            new Connector(this.cPoints[0], this.cPoints[6], 64, "#ff0000", true),
            new Connector(this.cPoints[3], this.cPoints[6], 64, "#ff0000", true),
            new Connector(this.cPoints[2], this.cPoints[3], 64, "#ff0000", true),
            new Connector(this.cPoints[3], this.cPoints[0], 64, "#ff0000", true),
            new Connector(this.cPoints[1], this.cPoints[4], 64, "#ff0000", true),
            new Connector(this.cPoints[2], this.cPoints[5], 64, "#ff0000", true),
            new Connector(this.cPoints[0], this.cPoints[4], 64, "#ff0000", true),
            new Connector(this.cPoints[3], this.cPoints[5], 64, "#ff0000", true)
        ];
        this.grabToCellLine = null;
    }

    update() {
        if (cellIsDead) {
            this.dead = true;
            this.grabToCellLine = null;
            return;
        }

        if (this.cLines.length !== 11) {
            this.dead = true;
            this.grabToCellLine = null;
            return;
        }

        if (this.dead == false) {
            var closestPoint = null;
            var closestDist = Infinity;

            if (this.grabToCellLine == null) {
                for (var i = 0; i < cPoints.length; i++) {
                    var point = cPoints[i];

                    var dist = point.position.subtract(this.cPoints[6].position).length();
                    if (dist < closestDist) {
                        closestDist = dist;
                        closestPoint = point;
                    }

                    if (i === cPoints.length - 1 && closestDist <= 5) {
                        // alert();
                        this.grabToCellLine = new Connector(this.cPoints[6], closestPoint, 64, "#ff8000", true);
                        break;
                    }
                }
            }

            if (this.grabToCellLine != null) {
                this.cPoints[6].velocity.plusEquals(this.grabToCellLine.pointB.position.subtract(this.grabToCellLine.pointA.position).normalized().multiply(-32));
            } else {
                this.cPoints[6].velocity.plusEquals(closestPoint.position.subtract(this.cPoints[6].position).normalized().multiply(0.02));
            }
        }
    }
}

var pathogens = [
    new Pathogen(-512, 0)
];

class CellImg {
    constructor(x, y, radius, organelles = []) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.organelles = organelles;
    }

    draw(context) {
        context.save();
        context.lineWidth = this.radius * 0.05;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.fillStyle = "#bfbfff";
        context.strokeStyle = "#606080";
        context.beginPath();

        if (this.organelles.includes("cell wall")) {
            context.rect(this.x - this.radius, this.y - this.radius * 1.1, this.radius * 2, this.radius * 2.2);
        } else {
            context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        }

        context.fill();

        if (this.organelles.includes("cell membrane")) {
            context.stroke();
        }

        context.closePath();

        if (this.organelles.includes("cell wall")) {
            context.strokeStyle = "#40bf40";
            context.beginPath();
            context.rect(this.x - this.radius * 1.05, this.y - this.radius * 1.15, this.radius * 2.1, this.radius * 2.3);
            context.stroke();
            context.closePath();
        }

        if (this.organelles.includes("chloroplasts")) {
            context.fillStyle = "#90ff90";
            context.lineWidth = this.radius * 0.02;
            context.strokeStyle = "#458045";
            context.save();
            context.translate(this.x, this.y);
            context.rotate(30 * degToRad);
            context.beginPath();
            context.ellipse(-this.radius * 0.8, 0, this.radius * 0.09, this.radius * 0.18, 0, 0, 2 * Math.PI, false);
            context.fill();
            context.stroke();
            context.closePath();
            context.restore();
        }

        if (this.organelles.includes("mitochondria")) {
            context.fillStyle = "#ff9090";
            context.lineWidth = this.radius * 0.02;
            context.strokeStyle = "#804545";
            context.save();
            context.translate(this.x, this.y);
            context.rotate(-30 * degToRad);
            context.beginPath();
            context.ellipse(this.radius * 0.7, 0, this.radius * 0.09, this.radius * 0.18, 0, 0, 2 * Math.PI, false);
            context.fill();
            context.stroke();
            context.closePath();
            context.restore();
        }

        if (this.organelles.includes("nucleoplasm")) {
            context.fillStyle = "#bfffff";
            context.lineWidth = this.radius * 0.02;
            context.strokeStyle = "#608080";
            context.save();
            context.beginPath();
            context.arc(this.x - this.radius * 0.1, this.y + this.radius * 0.16, this.radius * 0.24, 0, 2 * Math.PI, false);
            context.fill();
            if (this.organelles.includes("nuclear membrane")) {
                context.stroke();
            }
            context.closePath();
            context.restore();
        }

        if (this.organelles.includes("nucleolus")) {
            context.fillStyle = "#80ffbf";
            context.lineWidth = this.radius * 0.02;
            context.save();
            context.beginPath();
            context.arc(this.x - this.radius * 0.1, this.y + this.radius * 0.16, this.radius * 0.08, 0, 2 * Math.PI, false);
            context.fill();
            context.closePath();
            context.restore();
        }

        if (this.organelles.includes("RER")) {
            context.strokeStyle = "#ffbf80";
            context.lineWidth = this.radius * 0.06;
            context.save();
            context.beginPath();

            context.moveTo((this.x - this.radius * 0.1) - this.radius * 0.32, (this.y + this.radius * 0.16) + this.radius * 0.1);
            context.lineTo((this.x - this.radius * 0.1) - this.radius * 0.30, (this.y + this.radius * 0.16) - this.radius * 0.1);

            context.moveTo((this.x - this.radius * 0.1) - this.radius * 0.30, (this.y + this.radius * 0.16) - this.radius * 0.2);
            context.lineTo((this.x - this.radius * 0.1) - this.radius * 0.18, (this.y + this.radius * 0.16) - this.radius * 0.3);

            context.moveTo((this.x - this.radius * 0.1) - this.radius * 0.1, (this.y + this.radius * 0.16) - this.radius * 0.4);
            context.lineTo((this.x - this.radius * 0.1) + this.radius * 0.1, (this.y + this.radius * 0.16) - this.radius * 0.3);

            context.moveTo((this.x - this.radius * 0.1) - this.radius * 0.42, (this.y + this.radius * 0.16) - this.radius * 0.05);
            context.lineTo((this.x - this.radius * 0.1) - this.radius * 0.4, (this.y + this.radius * 0.16) - this.radius * 0.25);

            context.moveTo((this.x - this.radius * 0.1) - this.radius * 0.32, (this.y + this.radius * 0.16) - this.radius * 0.35);
            context.lineTo((this.x - this.radius * 0.1) - this.radius * 0.16, (this.y + this.radius * 0.16) - this.radius * 0.45);

            context.moveTo((this.x - this.radius * 0.1) - this.radius * 0.4, (this.y + this.radius * 0.16) - this.radius * 0.2);
            context.lineTo((this.x - this.radius * 0.1) - this.radius * 0.3, (this.y + this.radius * 0.16) - this.radius * 0.05);


            context.moveTo((this.x - this.radius * 0.1) - this.radius * 0.3, (this.y + this.radius * 0.16) - this.radius * 0.4);
            context.lineTo((this.x - this.radius * 0.1), (this.y + this.radius * 0.16) - this.radius * 0.32);

            context.moveTo((this.x - this.radius * 0.1) - this.radius * 0.4, (this.y + this.radius * 0.16) - this.radius * 0.4);
            context.lineTo((this.x - this.radius * 0.1) - this.radius * 0.28, (this.y + this.radius * 0.16) - this.radius * 0.15);

            context.stroke();
            context.closePath();

            context.fillStyle = "#804000";
            context.beginPath();
            context.arc((this.x - this.radius * 0.1) - this.radius * 0.32, (this.y + this.radius * 0.16) + this.radius * 0.1, this.radius * 0.02, 0, 2 * Math.PI, false);
            context.fill();
            context.closePath();

            context.beginPath();
            context.arc((this.x - this.radius * 0.1) - this.radius * 0.30, (this.y + this.radius * 0.16) - this.radius * 0.1, this.radius * 0.02, 0, 2 * Math.PI, false);
            context.fill();
            context.closePath();

            context.beginPath();
            context.arc((this.x - this.radius * 0.1) - this.radius * 0.30, (this.y + this.radius * 0.16) - this.radius * 0.2, this.radius * 0.02, 0, 2 * Math.PI, false);
            context.fill();
            context.closePath();

            context.beginPath();
            context.arc((this.x - this.radius * 0.1) - this.radius * 0.18, (this.y + this.radius * 0.16) - this.radius * 0.3, this.radius * 0.02, 0, 2 * Math.PI, false);
            context.fill();
            context.closePath();

            context.beginPath();
            context.arc((this.x - this.radius * 0.1) - this.radius * 0.1, (this.y + this.radius * 0.16) - this.radius * 0.4, this.radius * 0.02, 0, 2 * Math.PI, false);
            context.fill();
            context.closePath();

            context.beginPath();
            context.arc((this.x - this.radius * 0.1) + this.radius * 0.1, (this.y + this.radius * 0.16) - this.radius * 0.3, this.radius * 0.02, 0, 2 * Math.PI, false);
            context.fill();
            context.closePath();

            context.beginPath();
            context.arc((this.x - this.radius * 0.1) - this.radius * 0.42, (this.y + this.radius * 0.16) - this.radius * 0.05, this.radius * 0.02, 0, 2 * Math.PI, false);
            context.fill();
            context.closePath();

            context.beginPath();
            context.arc((this.x - this.radius * 0.1) - this.radius * 0.4, (this.y + this.radius * 0.16) - this.radius * 0.25, this.radius * 0.02, 0, 2 * Math.PI, false);
            context.fill();
            context.closePath();
            context.restore();
        }
        context.restore();
    }
}

function main() {
    if (Math.random() < 0.01) {
        if (Math.random() < 0.5) {
            pathogens.push(new Pathogen(-1536, random(-1536, 1536)));
        } else {
            pathogens.push(new Pathogen(1536, random(-1536, 1536)));
        }
    }

    if (paused == false) {
        if (cLines.length < startingSegments) {
            cellIsDead = true;
            displayGameEnd();
        }

        camera.x = (vWidth * 0.2) / camera.viewScale;
        camera.viewScale = Math.min(vWidth, vHeight) / 512 / 2;
    } else {
        camera.x = 0;
        camera.viewScale = 1;
    }

    for (var i = 0; i < cLines.length; i++) {
        var line = cLines[i];
        if (line.pointA === line.pointB || line.length === 0) {
            cLines.splice(i, 1);
            i--;
            continue;
        }
    }

    if (paused == false) {
        if (mouse.down) {
            var testPos = { x: mouse.x, y: mouse.y };
            var exitNow = false;
            var testSteps = Math.ceil(Math.abs(mouse.vx) + Math.abs(mouse.vy)) * 2 + 1;
            for (var j = 0; j < testSteps; j++) {
                for (var p = 0; p < pathogens.length; p++) {

                    for (var i = 0; i < pathogens[p].cLines.length; i++) {
                        var line = pathogens[p].cLines[i];
                        var col = distanceToPointFromLine(testPos, line);

                        if (col < 4) {
                            exitNow = true;
                            if (pathogens[p].dead == false) {
                                cellATP--;
                            }
                            if (cellATP < 0) {
                                cellATP = 0;
                                break;
                            }
                            if (line.length >= 4) {
                                var lineCenter = (line.pointA.position.add(line.pointB.position)).divide(2);
                                var lineDir = (line.pointA.position.subtract(line.pointB.position)).normalized();

                                var currentLength = (line.pointA.position.subtract(line.pointB.position));
                                if (Math.abs(currentLength.x) <= 0.0001 && Math.abs(currentLength.y) <= 0.0001) {
                                    lineDir = new Vec2(Math.random() * 2 - 1, Math.random() * 2 - 1).normalized();
                                }

                                var mouseVel = new Vec2(mouse.vx, mouse.vy).multiply(0);
                                var nP1P = lineCenter.subtract(lineDir.multiply(line.length / 2));
                                var newPoint1 = new ConnectionPoint(nP1P.x, nP1P.y, false);
                                newPoint1.velocity.add(mouseVel);
                                pathogens[p].cPoints.push(newPoint1);
                                var newLine1 = new Connector(line.pointA, newPoint1, line.length / 2, line.color);
                                var nP2P = lineCenter.add(lineDir.multiply(line.length / 2));
                                var newPoint2 = new ConnectionPoint(nP2P.x, nP2P.y, false);
                                newPoint2.velocity.add(mouseVel);
                                pathogens[p].cPoints.push(newPoint2);
                                var newLine2 = new Connector(line.pointB, newPoint2, line.length / 2, line.color);
                                pathogens[p].cLines.push(newLine1);
                                pathogens[p].cLines.push(newLine2);
                            }

                            pathogens[p].cLines.splice(i, 1);
                            break;
                        }
                    }

                    if (exitNow == true) {
                        break;
                    }
                }

                if (exitNow == true) {
                    break;
                }

                testPos.x += -mouse.vx / testSteps;
                testPos.y += -mouse.vy / testSteps;
            }
        }

        for (var i = 0; i < pathogens.length; i++) {
            var pathogen = pathogens[i];

            pathogen.update();

            for (var j = 0; j < pathogen.cPoints.length; j++) {
                var point = pathogen.cPoints[j];
                point.update();
            }
        }

        for (var i = 0; i < cPoints.length; i++) {
            var point = cPoints[i];
            point.update();
        }

        for (var i = 0; i < numIterations; i++) {
            for (var j = 0; j < cLines.length; j++) {
                var line = cLines[j];

                line.update();
            }

            for (var j = 0; j < pathogens.length; j++) {
                var pathogen = pathogens[j];

                for (var k = 0; k < pathogen.cLines.length; k++) {
                    var line = pathogen.cLines[k];
                    line.update();
                }

                if (pathogen.grabToCellLine != null) {
                    pathogen.grabToCellLine.update();
                }
            }
        }

        for (var i = 0; i < cLines.length; i++) {
            var line = cLines[i];

            var currentLength = line.pointB.position.subtract(line.pointA.position).length();
            if (currentLength / line.length >= 1.02) {
                cLines.splice(i, 1);
                i--;
            }
        }
    }

    ctx.save();
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.clearRect(0, 0, vWidth, vHeight);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, vWidth, vHeight);
    camera.applyToCtx(ctx);

    if (paused == true) {
        var aniCell = new CellImg(-vWidth * 0.25, 0, Math.min(vWidth, vHeight) * 0.25, ["mitochondria", "nucleolus", "nucleoplasm", "nuclear membrane", "cell membrane", "RER"]);
        var plantCell = new CellImg(vWidth * 0.25, 0, Math.min(vWidth, vHeight) * 0.25, ["chloroplasts", "mitochondria", "nucleolus", "nucleoplasm", "nuclear membrane", "cell membrane", "cell wall", "RER"]);
        aniCell.draw(ctx);
        plantCell.draw(ctx);
    } else {
        for (var i = 0; i < cLines.length; i++) {
            var line = cLines[i];
            line.draw(ctx);
        }

        for (var i = 0; i < pathogens.length; i++) {
            var pathogen = pathogens[i];

            for (var j = 0; j < pathogen.cLines.length; j++) {
                var line = pathogen.cLines[j];
                line.draw(ctx);
            }

            for (var j = 0; j < pathogen.cPoints.length; j++) {
                var point = pathogen.cPoints[j];
                point.draw(ctx, paused);
            }

            if (pathogen.grabToCellLine != null) {
                pathogen.grabToCellLine.draw(ctx);
            }
        }

        for (var i = 0; i < cPoints.length; i++) {
            var point = cPoints[i];
            point.draw(ctx, paused);
        }

        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 1;
        ctx.strokeRect(-halfBoundsX, -halfBoundsY, (halfBoundsX * 2), (halfBoundsY * 2));
    }

    // ctx.strokeStyle = "#ff0000";
    // ctx.beginPath();
    // ctx.moveTo(-vWidth / 2, 0);
    // ctx.lineTo(vWidth / 2, 0);
    // ctx.stroke();
    // ctx.closePath();

    ctx.restore();

    if (paused == false) {
        ctx.save();
        ctx.fillStyle = "#ffffff";
        ctx.font = "16px arial";
        ctx.fillText("Amount of ATP: " + cellATP, 4, 20);
        ctx.restore();
    }
}

window.onload = function () {
    updateIdx = setInterval(main, 1000 / tFps);
}

window.addEventListener("resize", resizeCanvas);

window.addEventListener("keydown", (e) => {
    keysDown[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    keysDown[e.key] = false;
});

window.addEventListener("contextmenu", (e) => {
    e.preventDefault();
});

scene.addEventListener("mousedown", (e) => {
    if (e.button === 0) {
        mouse.down = true;
    }

    if (e.button === 2) {
        mouse.rightdown = true;
    }

    var mousePos = camera.applyToMouse(ctx, e.clientX, e.clientY);
    mouse.x = mousePos.x;
    mouse.y = mousePos.y;
});

scene.addEventListener("mousemove", (e) => {
    var mpx = mouse.x;
    var mpy = mouse.y;
    var mousePos = camera.applyToMouse(ctx, e.clientX, e.clientY);
    mouse.x = mousePos.x;
    mouse.y = mousePos.y;
    mouse.vx = mouse.x - mpx;
    mouse.vy = mouse.y - mpy;
});

window.addEventListener("mouseup", () => {
    mouse.down = false;
    mouse.rightdown = false;
});


// MUST ADAPT THIS CODE

// function main() {
//     // cLines.sort(() => (Math.random() > .5) ? 1 : -1);
// }

replayGameBtn.onclick = function () {
    questionSet.reset();
    updateRadioButtons();
    cPoints = [];
    cLines = [];
    pathogens = [
        new Pathogen(-512, 0)
    ];
    createCell(0, 0, 256, 64);
    cellATP = 0;
    cellIsDead = false;
    startingSegments = cLines.length;
}
