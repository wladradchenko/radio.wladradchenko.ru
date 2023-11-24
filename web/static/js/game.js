let randomInt = Math.floor(Math.random() * 150) + 1;  // Generates a random integer between 1 and 150
let potentialUrl = `https://wladradchenko.ru/static/radio.wladradchenko.ru/lofi/${randomInt}.mp3`;
let defaultUrl = '/static/game/audio/bgG.mp3';

bg = new Audio(potentialUrl);
bg.addEventListener('error', (event) => {
  // Handle the error here
  console.error('Error loading audio file:', event.target.error.message);

  // Revert to a default audio file
  bg.src = defaultUrl;
});


buttonClick = new Audio('/static/game/audio/Buttonclick.mp3');
featured = new Audio('/static/game/audio/featured.mp3');
slideSlow = new Audio('/static/game/audio/slideSlow.mp3');
countStats = new Audio('/static/game/audio/Countupstats.mp3');
researchClick = new Audio('/static/game/audio/researchClick.mp3');
researchInactive = new Audio('/static/game/audio/researchInactive.mp3');
slideFast = new Audio('/static/game/audio/slideFast.mp3');
featuredModal = new Audio('/static/game/audio/researchComplete.mp3');
researchComplete = new Audio('/static/game/audio/researchComplete.mp3');

const penProgressEl = $('.pen');
const statAddSounds = []

for(i = 0; i < 10; i++) {
    let a  = new Audio('/static/game/audio/statAdd.mp3');
    statAddSounds.push(a)
}

pen_id = $('._pen_id').text();

function updateMyStatsUi() {
    $('.mystats_css span.val').html(developer.css.toLocaleString());
    $('.mystats_html span.val').html(developer.html.toLocaleString());
    $('.mystats_js span.val').html(developer.js.toLocaleString());
    $('.mystats_design span.val').html(developer.design.toLocaleString());
}

const globals = {
    'timerTick' : 120,
    'keyTick' : 110,
    'penStatAddChance' : 4,
    'typeIncrement' : 1.1,
    'makingPen' : true,
    'penInProgress' : false,
    'viewDecay' : 1.1,
    'maxBars' : 30,
    'followerFriction' : 50,
    'viewMultiplier' : 1.15,
    'researchTime' : 2000,
    'researching' : false,
    'featuredMinStats' : 500,
    'featuredBoost' : 3.1,
    'featureChance' : 10,
    'paused' : true,
    'gameLength' : 365,
    'audio' : true,
    'auto' : false
}

function getUrlParamsGame() {
  const searchParams = new URLSearchParams(window.location.search);
  return Object.fromEntries(searchParams.entries());
}
const urlParamsGame = getUrlParamsGame();
const langGame = urlParamsGame.lang === 'eng' ? 'eng' : 'rus';

const translationsPenNames = {
  "rus": [
    'Основы нейронной сети',
    'Сети GAN',
    'Естественный язык',
    'Машинное обучение',
    'Сверточные сети',
    'Обучение с подкреплением',
    'Этика в AI',
    'Рекуррентные сети',
    'Чат-боты',
    'Python и нейроны',
    'Глубокое обучение',
    'Большие данные',
    'Оптимизация алгоритмов',
    'Голосовое распознавание',
    'Защита данных',
    'Облачные вычисления',
    'Переносное обучение',
    'Симуляции в AI',
    'Нейроинтерфейсы',
    'Серверная архитектура',
    'Quantum вычисления',
    'Блокчейн разработка',
    'IoT технологии',
    'Автоматизация ML',
    'RESTful API',
    'Микросервисы',
    'JS фреймворки',
    'Разработка на NoSQL',
    'Встраиваемые системы',
    'Компьютерное зрение',
    'Игровое программирование',
    'VR и AR технологии',
    'Мобильная разработка',
    'Web дизайн',
    'Безопасность в интернете',
    'Базы данных SQL',
    'Прототипирование UI/UX',
    'Тестирование ПО',
    'Код рефакторинг',
    'Будущее разработки'
  ],
  "eng": [
    'Fundamentals of Neural Networks',
    'GAN Networks',
    'Natural Language Processing',
    'Machine Learning',
    'Convolutional Networks',
    'Reinforcement Learning',
    'Ethics in AI',
    'Recurrent Networks',
    'Chatbots',
    'Python and Neurons',
    'Deep Learning',
    'Big Data',
    'Algorithm Optimization',
    'Voice Recognition',
    'Data Protection',
    'Cloud Computing',
    'Transfer Learning',
    'AI Simulations',
    'Neural Interfaces',
    'Server Architecture',
    'Quantum Computing',
    'Blockchain Development',
    'IoT Technologies',
    'ML Automation',
    'RESTful API',
    'Microservices',
    'JS Frameworks',
    'NoSQL Development',
    'Embedded Systems',
    'Computer Vision',
    'Game Programming',
    'VR and AR Technologies',
    'Mobile Development',
    'Web Design',
    'Internet Security',
    'SQL Databases',
    'UI/UX Prototyping',
    'Software Testing',
    'Code Refactoring',
    'Future of Development'
  ]
};

const penNames = translationsPenNames[langGame];


const translationsResearch = {
  "rus": [
    {
        'index' : 1,
        'name' : 'Изучить основы грамматики',
        'cost' : 10,
        'increaseCss' : 0,
        'increaseJs' : 0,
        'increaseHtml' : 10,
        'increaseDesign' : 0,
        'researched' : false
    },{
        'index' : 2,
        'name' : 'Узнать как исследовать',
        'cost' : 20,
        'increaseCss' : 10,
        'increaseJs' : 0,
        'increaseHtml' : 0,
        'increaseDesign' : 0,
        'researched' : false
    },{
        'index' : 3,
        'name' : 'Улучшить стиль',
        'cost' : 30,
        'increaseCss' : 0,
        'increaseJs' : 10,
        'increaseHtml' : 0,
        'increaseDesign' : 0,
        'researched' : false
    },{
        'index' : 4,
        'name' : 'Повысить креативность',
        'cost' : 50,
        'increaseCss' : 0,
        'increaseJs' : 0,
        'increaseHtml' : 0,
        'increaseDesign' : 10,
        'researched' : false
    },{
        'index' : 5,
        'name' : 'Собрать источники',
        'cost' : 100,
        'increaseCss' : 10,
        'increaseJs' : 10,
        'increaseHtml' :10,
        'increaseDesign' : 15,
        'researched' : false
    },{
        'index' : 6,
        'name' : 'Изучить основы продвижения',
        'cost' : 150,
        'increaseCss' : 0,
        'increaseJs' : 0,
        'increaseHtml' : 15,
        'increaseDesign' : 0,
        'researched' : false
    },{
        'index' : 7,
        'name' : 'Видеомонтаж',
        'cost' : 200,
        'increaseCss' : 15,
        'increaseJs' : 0,
        'increaseHtml' : 0,
        'increaseDesign' : 0,
        'researched' : false
    },{
        'index' : 8,
        'name' : 'Генерация картинок',
        'cost' : 300,
        'increaseCss' : 0,
        'increaseJs' : 15,
        'increaseHtml' : 0,
        'increaseDesign' : 0,
        'researched' : false
    },{
        'index' : 9,
        'name' : 'Получить собственный стиль',
        'cost' : 400,
        'increaseCss' : 0,
        'increaseJs' : 0,
        'increaseHtml' : 0,
        'increaseDesign' : 15,
        'researched' : false
    },{
        'index' : 10,
        'name' : 'Узнать о продвижении',
        'cost' : 600,
        'increaseCss' : 15,
        'increaseJs' : 20,
        'increaseHtml' : 10,
        'increaseDesign' : 0,
        'researched' : false
    },{
        'index' : 11,
        'name' : 'Улучшить свои комментарии',
        'cost' : 800,
        'increaseCss' : 0,
        'increaseJs' : 0,
        'increaseHtml' : 20,
        'increaseDesign' : 0,
        'researched' : false
    },{
        'index' : 12,
        'name' : 'Попасть в авторы недели',
        'cost' : 1150,
        'increaseCss' : 20,
        'increaseJs' : 0,
        'increaseHtml' : 0,
        'increaseDesign' : 0,
        'researched' : false
    },{
        'index' : 13,
        'name' : 'Увеличить колличество репостов',
        'cost' : 1400,
        'increaseCss' : 0,
        'increaseJs' : 20,
        'increaseHtml' : 0,
        'increaseDesign' : 0,
        'researched' : false
    },{
        'index' : 14,
        'name' : 'Запомнить названия шрифтов',
        'cost' : 1800,
        'increaseCss' : 0,
        'increaseJs' : 0,
        'increaseHtml' : 0,
        'increaseDesign' : 20,
        'researched' : false
    },
    {
        'index' : 15,
        'name' : 'Смотреть обучающие ролики',
        'cost' : 2200,
        'increaseCss' : 10,
        'increaseJs' : 10,
        'increaseHtml' : 10,
        'increaseDesign' : 10,
        'researched' : false
    },{
        'index' : 16,
        'name' : 'Отркыть групповые чаты',
        'cost' : 2700,
        'increaseCss' : 0,
        'increaseJs' : 0,
        'increaseHtml' : 25,
        'increaseDesign' : 0,
        'researched' : false
    },{
        'index' : 17,
        'name' : 'Изучите препроцессоры',
        'cost' : 3200,
        'increaseCss' : 25,
        'increaseJs' : 0,
        'increaseHtml' : 0,
        'increaseDesign' : 0,
        'researched' : false
    },{
        'index' : 18,
        'name' : 'Изучите нейронные сети',
        'cost' : 3800,
        'increaseCss' : 0,
        'increaseJs' : 25,
        'increaseHtml' : 0,
        'increaseDesign' : 0,
        'researched' : false
    },{
        'index' : 19,
        'name' : 'Улучшить качество видео',
        'cost' : 4500,
        'increaseCss' : 0,
        'increaseJs' : 0,
        'increaseHtml' : 0,
        'increaseDesign' : 25,
        'researched' : false
    },{
        'index' : 20,
        'name' : 'Улучшить набор инструментов',
        'cost' : 5200,
        'increaseCss' : 10,
        'increaseJs' : 10,
        'increaseHtml' : 10,
        'increaseDesign' : 25,
        'researched' : false
    },{
        'index' : 21,
        'name' : 'Научить программировать статьи',
        'cost' : 6000,
        'increaseCss' : 15,
        'increaseJs' : 15,
        'increaseHtml' : 15,
        'increaseDesign' : 10,
        'researched' : false
    },{
        'index' : 22,
        'name' : 'Подключить креативные нейронные сети',
        'cost' : 6600,
        'increaseCss' : 0,
        'increaseJs' : 25,
        'increaseHtml' : 0,
        'increaseDesign' : 0,
        'researched' : false
    },{
        'index' : 23,
        'name' : 'Выучить VR технологии',
        'cost' : 7500,
        'increaseCss' : 0,
        'increaseJs' : 30,
        'increaseHtml' : 0,
        'increaseDesign' : 0,
        'researched' : false
    },{
        'index' : 24,
        'name' : 'Экспериментируйте с новейшими технологиями',
        'cost' : 9000,
        'increaseCss' : 20,
        'increaseJs' : 20,
        'increaseHtml' : 20,
        'increaseDesign' : 10,
        'researched' : false
    },{
        'index' : 25,
        'name' : 'Повыстье свое мастерство в грамматики',
        'cost' : 11000,
        'increaseCss' : 0,
        'increaseJs' : 0,
        'increaseHtml' : 60,
        'increaseDesign' : 0,
        'researched' : false
    },{
        'index' : 26,
        'name' : 'Повыстье свое мастерство в исследовательности',
        'cost' : 12000,
        'increaseCss' : 60,
        'increaseJs' : 0,
        'increaseHtml' : 0,
        'increaseDesign' : 0,
        'researched' : false
    },{
        'index' : 27,
        'name' : 'Повыстье свое мастерство в стиле',
        'cost' : 13000,
        'increaseCss' : 0,
        'increaseJs' : 60,
        'increaseHtml' : 0,
        'increaseDesign' : 0,
        'researched' : false
    },{
        'index' : 28,
        'name' : 'Повыстье свое мастерство в креативности',
        'cost' : 14000,
        'increaseCss' : 0,
        'increaseJs' : 0,
        'increaseHtml' : 0,
        'increaseDesign' : 60,
        'researched' : false
    },{
        'index' : 29,
        'name' : 'Создать везде свой канал',
        'cost' : 15000,
        'increaseCss' : 30,
        'increaseJs' : 30,
        'increaseHtml' : 30,
        'increaseDesign' : 20,
        'researched' : false
    }
  ],
  "eng": [
    {
        'index': 1,
        'name': 'Study Grammar Fundamentals',
        'cost': 10,
        'increaseCss': 0,
        'increaseJs': 0,
        'increaseHtml': 10,
        'increaseDesign': 0,
        'researched': false
    },{
        'index': 2,
        'name': 'Learn How to Research',
        'cost': 20,
        'increaseCss': 10,
        'increaseJs': 0,
        'increaseHtml': 0,
        'increaseDesign': 0,
        'researched': false
    },{
        'index': 3,
        'name': 'Improve Style',
        'cost': 30,
        'increaseCss': 0,
        'increaseJs': 10,
        'increaseHtml': 0,
        'increaseDesign': 0,
        'researched': false
    },{
        'index': 4,
        'name': 'Enhance Creativity',
        'cost': 50,
        'increaseCss': 0,
        'increaseJs': 0,
        'increaseHtml': 0,
        'increaseDesign': 10,
        'researched': false
    },{
        'index': 5,
        'name': 'Gather Sources',
        'cost': 100,
        'increaseCss': 10,
        'increaseJs': 10,
        'increaseHtml':10,
        'increaseDesign': 15,
        'researched': false
    },{
        'index': 6,
        'name': 'Study Fundamentals of Promotion',
        'cost': 150,
        'increaseCss': 0,
        'increaseJs': 0,
        'increaseHtml': 15,
        'increaseDesign': 0,
        'researched': false
    },{
        'index': 7,
        'name': 'Video Editing',
        'cost': 200,
        'increaseCss': 15,
        'increaseJs': 0,
        'increaseHtml': 0,
        'increaseDesign': 0,
        'researched': false
    },{
        'index': 8,
        'name': 'Image Generation',
        'cost': 300,
        'increaseCss': 0,
        'increaseJs': 15,
        'increaseHtml': 0,
        'increaseDesign': 0,
        'researched': false
    },{
        'index': 9,
        'name': 'Develop Personal Style',
        'cost': 400,
        'increaseCss': 0,
        'increaseJs': 0,
        'increaseHtml': 0,
        'increaseDesign': 15,
        'researched': false
    },{
        'index': 10,
        'name': 'Learn about Promotion',
        'cost': 600,
        'increaseCss': 15,
        'increaseJs': 20,
        'increaseHtml': 10,
        'increaseDesign': 0,
        'researched': false
    },{
        'index': 11,
        'name': 'Improve Your Comments',
        'cost': 800,
        'increaseCss': 0,
        'increaseJs': 0,
        'increaseHtml': 20,
        'increaseDesign': 0,
        'researched': false
    },{
        'index': 12,
        'name': 'Get into Authors of the Week',
        'cost': 1150,
        'increaseCss': 20,
        'increaseJs': 0,
        'increaseHtml': 0,
        'increaseDesign': 0,
        'researched': false
    },{
        'index': 13,
        'name': 'Increase Reposts',
        'cost': 1400,
        'increaseCss': 0,
        'increaseJs': 20,
        'increaseHtml': 0,
        'increaseDesign': 0,
        'researched': false
    },{
        'index': 14,
        'name': 'Remember Font Names',
        'cost': 1800,
        'increaseCss': 0,
        'increaseJs': 0,
        'increaseHtml': 0,
        'increaseDesign': 20,
        'researched': false
    },{
        'index': 15,
        'name': 'Watch Educational Videos',
        'cost': 2200,
        'increaseCss': 10,
        'increaseJs': 10,
        'increaseHtml': 10,
        'increaseDesign': 10,
        'researched': false
    },{
        'index': 16,
        'name': 'Open Group Chats',
        'cost': 2700,
        'increaseCss': 0,
        'increaseJs': 0,
        'increaseHtml': 25,
        'increaseDesign': 0,
        'researched': false
    },{
        'index': 17,
        'name': 'Learn Preprocessors',
        'cost': 3200,
        'increaseCss': 25,
        'increaseJs': 0,
        'increaseHtml': 0,
        'increaseDesign': 0,
        'researched': false
    },{
        'index': 18,
        'name': 'Study Neural Networks',
        'cost': 3800,
        'increaseCss': 0,
        'increaseJs': 25,
        'increaseHtml': 0,
        'increaseDesign': 0,
        'researched': false
    },{
        'index': 19,
        'name': 'Enhance Video Quality',
        'cost': 4500,
        'increaseCss': 0,
        'increaseJs': 0,
        'increaseHtml': 0,
        'increaseDesign': 25,
        'researched': false
    },{
        'index': 20,
        'name': 'Improve Toolset',
        'cost': 5200,
        'increaseCss': 10,
        'increaseJs': 10,
        'increaseHtml': 10,
        'increaseDesign': 25,
        'researched': false
    },{
        'index': 21,
        'name': 'Teach Writing Articles',
        'cost': 6000,
        'increaseCss': 15,
        'increaseJs': 15,
        'increaseHtml': 15,
        'increaseDesign': 10,
        'researched': false
    },{
        'index': 22,
        'name': 'Connect Creative Neural Networks',
        'cost': 6600,
        'increaseCss': 0,
        'increaseJs': 25,
        'increaseHtml': 0,
        'increaseDesign': 0,
        'researched': false
    },{
        'index': 23,
        'name': 'Learn VR Technologies',
        'cost': 7500,
        'increaseCss': 0,
        'increaseJs': 30,
        'increaseHtml': 0,
        'increaseDesign': 0,
        'researched': false
    },{
        'index': 24,
        'name': 'Experiment with Latest Technologies',
        'cost': 9000,
        'increaseCss': 20,
        'increaseJs': 20,
        'increaseHtml': 20,
        'increaseDesign': 10,
        'researched': false
    },{
        'index': 25,
        'name': 'Enhance Grammar Mastery',
        'cost': 11000,
        'increaseCss': 0,
        'increaseJs': 0,
        'increaseHtml': 60,
        'increaseDesign': 0,
        'researched': false
    },{
        'index': 26,
        'name': 'Enhance Research Mastery',
        'cost': 12000,
        'increaseCss': 60,
        'increaseJs': 0,
        'increaseHtml': 0,
        'increaseDesign': 0,
        'researched': false
    },{
        'index': 27,
        'name': 'Enhance Style Mastery',
        'cost': 13000,
        'increaseCss': 0,
        'increaseJs': 60,
        'increaseHtml': 0,
        'increaseDesign': 0,
        'researched': false
    },{
        'index': 28,
        'name': 'Enhance Creativity Mastery',
        'cost': 14000,
        'increaseCss': 0,
        'increaseJs': 0,
        'increaseHtml': 0,
        'increaseDesign': 60,
        'researched': false
    },{
        'index': 29,
        'name': 'Create Personal Channel Everywhere',
        'cost': 15000,
        'increaseCss': 30,
        'increaseJs': 30,
        'increaseHtml': 30,
        'increaseDesign': 20,
        'researched': false
    }
  ]
};

const research = translationsResearch[langGame];

research.forEach(function(r) {
  const languageContent = {
      eng: {
          grammar: 'Grammar',
          research: 'Research',
          style: 'Style',
          creativity: 'Creativity',
          acquireSkill: 'Acquire Skill',
      },
      rus: {
          grammar: 'Грамматика',
          research: 'Исследованность',
          style: 'Стиль',
          creativity: 'Креативность',
          acquireSkill: 'Получить навык',
      }
  };

  const langContent = langGame === 'eng' ? languageContent.eng : languageContent.rus;

  const increaseGrammar = langContent.grammar + (r.increaseHtml > 0 ? ` <span class="green">+ ${r.increaseHtml}<img src="/static/game/assets/arrowUpStat.png"/></span><div class="sep"></div>` : '');
  const increaseResearch = langContent.research + (r.increaseCss > 0 ? ` <span class="green">+ ${r.increaseCss}<img src="/static/game/assets/arrowUpStat.png"/></span><div class="sep"></div>` : '');
  const increaseStyle = langContent.style + (r.increaseJs > 0 ? ` <span class="green">+ ${r.increaseJs}<img src="/static/game/assets/arrowUpStat.png"/></span><div class="sep"></div>` : '');
  const increaseCreativity = langContent.creativity + (r.increaseDesign > 0 ? ` <span class="green">+ ${r.increaseDesign}<img src="/static/game/assets/arrowUpStat.png"/></span><div class="sep"></div>` : '');
  const acquireSkillText = langContent.acquireSkill;

  $('.research_modal__list').append(`
    <div class="item" style="display: flex;flex-direction: column;text-align: center;">
      <div>
        <div class="name" style="text-align: left;">${r.name}<div class="sep"></div></div>
        <div class="stat" style="text-align: left;">
          ${increaseGrammar}
          ${increaseResearch}
          ${increaseStyle}
          ${increaseCreativity}
        </div>
      </div>
      <div class="research_button" data-index="${r.index}" style="margin-top: 20px">
        <div class="pixelsTop"></div>
        <div class="pixelsBottom"></div>${acquireSkillText} <img src="/static/game/assets/rCost.png" /><span class="cost">${r.cost.toLocaleString()}</div>
      </div>
  `);
});


$('.auto').click(function(){
    playSound(buttonClick);
    if(globals.auto) {
        $(this).removeClass('on');
        $(this).addClass('off');
        globals.auto = false;
    } else {
        $(this).removeClass('off');
        $(this).addClass('on');
        globals.auto = true;
    }
})

$('.researchButton').click(function() {
    if(!globals.researching) {
        globals.paused = true;
        $('.overlay, .research_modal').show();
        playSound(buttonClick);
        playSound(slideFast);
        $('.research_modal').show();

        setTimeout(function() {
            $('.research_modal').css('opacity', '1');
        },300)

        $('.overlay').fadeIn(function() {
            setTimeout(function() {
                $('.research_modal').css('height' , '400px');
                $('.research_modal').css('width' , '80vw');

                setTimeout(function() {
                    $('.research_modal .hide').fadeIn();
                }, 400)
            },100)
        });
    } else {
        playSound(researchInactive);
    }

    $('.research_modal .item').each(function() {
        let index = $(this).find('.research_button').data('index') - 1;
        if(developer.followers >= research[index].cost && research[index].researched == false) {
            $(this).addClass('available') 
            $(this).removeClass('unavailable')  
            $(this).removeClass('researched')  
        }

        if(developer.followers < research[index].cost && research[index].researched == false) {
            $(this).addClass('unavailable')   
            $(this).removeClass('available')  
            $(this).removeClass('researched')  
        }

        if(research[index].researched == true) {
            $(this).addClass('researched')   
            $(this).removeClass('available')  
            $(this).removeClass('unavailable')  
        }
    })
})

audioSwitch = 0;
sfxSwitch = 0;

$('.options_sf').click(function() {
    if(sfxSwitch == 0) {
        globals.audio = false;
        sfxSwitch = 1;
        $(this).css('opacity','0.4');
    } else {
        globals.audio = true;
        sfxSwitch = 0;
        $(this).css('opacity','1');
    }
});

$('.options_bg').click(function() {
    if(audioSwitch == 0) {
        $(bg).animate({volume: 0}, 600);
        audioSwitch = 1;
        $(this).css('opacity','0.4')
    } else {
        $(bg).animate({volume: 1}, 600);
        audioSwitch = 0;
        $(this).css('opacity','1')
    }
})

$('.research_modal .close').click(function() {
    playSound(buttonClick)
    $('.research_modal').css('opacity', '0');
    setTimeout(function(){
        $('.overlay').fadeOut();
    },450)

    setTimeout(function(){

        $('.research_modal').attr('style', '');
        $('.research_modal .hide').attr('style', '');
    },1000)

    globals.paused = false;
})

$('body').on('click', '.research_button', function() {
    globals.paused = false;
    let r = $(this).data('index') - 1;
    let stat = research[r].stat;
    let increaseCss = research[r].increaseCss;
    let increaseJs = research[r].increaseJs;
    let increaseHtml = research[r].increaseHtml;
    let increaseDesign = research[r].increaseDesign;

    if(developer.followers > research[r].cost && research[r].researched == false && !globals.researching) {
        globals.researching = true;
        $('.overlay, .research_modal').fadeOut();
        $('.researchProgress').show();
        $('.researchProgress').show()
        playSound(researchClick)
        rp = setInterval(function(){
            $('.bar_inner').addClass('animate')
        },1)

        setTimeout(function() {
            clearInterval(rp)
            developer.css += increaseCss
            developer.js += increaseJs
            developer.html += increaseHtml
            developer.design += increaseDesign
            research[r].researched = true;
            $('.researchProgress').hide()
            globals.researching = false;
            playSound(researchComplete)
            updateMyStatsUi(); 
        }, globals.researchTime)

    } else {
        playSound(researchInactive)
    }
})

const statColors = {
    'html' : '#f16529',
    'css' : '#2965f1',
    'js' : '#d87b17',
    'design' : '#9d28e0'
}

var developer = {
    'name'      : 'Wlad',
    'level'     : 1,
    'html'      : 3,
    'css'       : 3,
    'js'        : 3,
    'design'    : 3,
    'followers' : 0
}

var pen = {
    'name' : 'Pen',
    'css'  : 0,
    'html' : 0,
    'js'   : 0,
    'design': 0
}

var pens = [];
updateMyStatsUi()
document.addEventListener("click", keyPress, false);

var progress = 0;

kS = 0;

function keyPress() {
    if(progress > 0) {
        if (langGame == "eng") {
          $('.startMashing h2 span').html("That's it, keep going");
        } else {
          $('.startMashing h2 span').html("Вот так, продолжай")
        };
    }

    if(progress > 20) {
      if (langGame == "eng") {
        $('.startMashing h2 span').html("Almost there!");
      } else {
        $('.startMashing h2 span').html("Уже близко!")
      };
    }

    if(progress > 40) {
      if (langGame == "eng") {
        $('.startMashing h2 span').html("Don't stop");
      } else {
        $('.startMashing h2 span').html("Не останавливайся")
      };
    }

    if(progress > 70) {
      if (langGame == "eng") {
        $('.startMashing h2 span').html("Almost finished");
      } else {
        $('.startMashing h2 span').html("Практически закончил")
      };
    }

    if(progress > 99) {
      if (langGame == "eng") {
        $('.startMashing h2 span').html("Done!");
      } else {
        $('.startMashing h2 span').html("Готово!")
      };
    }
    if(globals.makingPen && progress < 100 ) {
        if(!globals.researching && !globals.paused) {
            progress += globals.typeIncrement

            $('.pen_bar_progress').width(progress + '%');

            // Create a random number between 0 and the penStatChance variable
            let add =  Math.floor(Math.random() * globals.penStatAddChance) + (globals.penStatAddChance - 2);

            if(add == globals.penStatAddChance) {

                // Each keystroke, IF random check passes, pick a number between 1 and 3
                let stat =  Math.floor(Math.random() * 4) + 1;

                if(kS < statAddSounds.length - 1) {
                    kS++
                } else {
                    kS = 0
                }

                playSound(statAddSounds[kS])

                // Assign a stat based on the integer
                if(stat == 1) {
                    let htmlStat = Math.floor(Math.random() * developer.html) + 1;
                    pen.html = pen.html + htmlStat;
                    makePip(statColors.html, htmlStat, 'html');
                }

                if(stat == 2) {
                    let cssStat = Math.floor(Math.random() * developer.css) + 1;
                    pen.css = pen.css + cssStat;
                    makePip(statColors.css, cssStat, 'css');
                }

                if(stat == 3) {
                    let jsStat = Math.floor(Math.random() * developer.js) + 1;
                    pen.js = pen.js + jsStat;
                    makePip(statColors.js, jsStat, 'js');
                }

                if(stat == 4) {
                    let designStat = Math.floor(Math.random() * developer.design) + 1;
                    pen.design = pen.design + designStat;
                    makePip(statColors.design, designStat, 'design');
                }
            }
            updateStatUi();
        }
    } else {

        $('.complete_modal').show();
        playSound(featured)
        setTimeout(function(){
            playSound(slideFast)
        },400)

        setTimeout(function(){
            $('.complete_modal').css('opacity', '1')
        },300)
        $('.overlay').fadeIn(function(){

            setTimeout(function(){
                $('.complete_modal').css('height' , '470px')
                $('.complete_modal').css('width' , '80vw')
                setTimeout(function(){
                    $('.complete_modal div.hide').fadeIn();
                }, 300)
            },100)
        });
        $('.complete_modal .html span span').html(pen.html)
        $('.complete_modal .css span span').html(pen.css)
        $('.complete_modal .js span span').html(pen.js)
        $('.complete_modal .design span span').html(pen.design)
        globals.paused = true;

    }
}

function updateStatUi() { 
    $('.pen_css span.val').html(pen.css.toLocaleString());
    $('.pen_html span.val').html(pen.html.toLocaleString());
    $('.pen_js span.val').html(pen.js.toLocaleString());
    $('.pen_design span.val').html(pen.design.toLocaleString());
}

$('.make').click(function() {
    globals.makingPen = true;
    penProgressEl.show();
    $('.make').hide();
});

function makePip(stat, int, type) {
    $('body').append(`<div class="pip" data-type="${type}"><div class="pixelsTop"></div><div class="pixelsBottom"></div><p style="color:${stat};">${int}</p></div>`);
}

$('.release').click(function() {
    playSound(buttonClick)
    release(pen)
    globals.paused = false;
    playSound(slideSlow)
})

$('.scrap').click(function(){
    playSound(buttonClick)
    globals.paused = false;
    if (langGame === "eng") {
        $('.startMashing h2 span').html("Click on display");
    } else {
        $('.startMashing h2 span').html("Кликни на экран");
    };

    $('.complete_modal').fadeOut();

    setTimeout(function(){
        $('.overlay').fadeOut()
    }, 450)

    progress = 0;
    $('.pen_bar_progress').width(0);

    pen.css = 0;
    pen.html = 0;
    pen.js = 0;
    pen.design = 0;

    setTimeout(function(){
        $('.complete_modal').attr('style', '');
        $('.complete_modal div').attr('style', '');
    },2000)

    updateStatUi();
})

function release(p) {
    if (langGame === "eng") {
        $('.startMashing h2 span').html("Click on the screen to write an post");
    } else {
        $('.startMashing h2 span').html("Кликай на экран, чтобы написать статью");
    };
    progress = 0;
    $('.releasedEmpty').remove()
    $('.overlay').fadeOut();
    $('.complete_modal').css('height','61px')
    $('.complete_modal').css('width','299px')
    $('.complete_modal').css( 'top', '298px')   
    $('.complete_modal').css( 'left', '100%') 
    $('.complete_modal').css( 'transform', 'translateX(calc(-100% - 57px))')

    setTimeout(function(){
        $('.released_pen').css('height', '150px')
    },210)
    setTimeout(function(){
        $('.released_pen').css('opacity', '1');

        $('.released_pen__bottom').css('top','-10px')

    },510)

    setTimeout(function(){
        $('.complete_modal').css('opacity', '0');
    },850)

    setTimeout(function(){
        $('.complete_modal').attr('style', '');
        $('.complete_modal div').attr('style', '');
    },2000)

    $('.complete_modal div').css('opacity', '0')
    let name =  Math.floor(Math.random() * penNames.length);

    let newPen = {
        'name' : penNames[name],
        'css'  : p.css,
        'html' : p.html,
        'js'   : p.js, 
        'design' : p.design,
        'views' : 0,
        'maxViews' : ((Math.ceil((p.css + p.js + p.html + p.design) * globals.viewMultiplier) + 1) * (pens.length + 1 / 35)),
        'dailyViews' : ((Math.ceil((p.css + p.js + p.html + p.design) * globals.viewMultiplier) + 1) * (pens.length + 1/ 35)),
        'comments' : 0,
        'likes' : 0,
        'featured' : false,
        'featuredBoosted' : false,
        'featuredCheck' : false,
        'featuredCheckCount' : 0
    }

    pens.push(newPen);

    $('.pen_bar_progress').width(0);

    pen.css = 0;
    pen.html = 0;
    pen.js = 0;
    pen.design = 0;
    updateStatUi();
    setTimeout(function(){
        $('.released').prepend(`<div class="released_pen" style="opacity:0"><div class="released_pen__top"><div class="pixelsTop"></div><div class="pixelsBottom"></div><span class="name">${pens[pens.length - 1].name}</span><div class="star"></div><div class="released_pen__graph"></div></div><div class="released_pen__bottom"><div class="pixelsTop"></div><div class="pixelsBottom"></div><img class="views" src="/static/game/assets/codepenViews.png" /><span class="view_count">${pens[pens.length - 1].views}</span><div class="sep"></div><img class="likes" src="/static/game/assets/codepenLikes.png" /><span class="like_count"> ${pens[pens.length - 1].likes}</span><div class="sep"></div><img class="comments" src="/static/game/assets/codepenComments.png" /><span class="comment_count"> ${pens[pens.length - 1].comments}</span></div></div>`)

    }, 1)
}
const translationsMonthNames = {
  "rus": ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
  "eng": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
};
const monthNames = translationsMonthNames[langGame];
var time = 0;

const rootStatElementPosition = {
    'design' : '550px',
    'html' : '-550px',
    'css' : '-176px',
    'js' : '180px'
}

const translationsPickers = {"rus": ['читателями'], "eng": ["readers"]}
const pickers = translationsPickers[langGame];

d = 0;

function fetchBestScore() {
  const existingData = JSON.parse(localStorage.getItem('userScores'));

  if (existingData) {
      let bestScoreEntry = getBestScore(existingData);
      if (bestScoreEntry) {
          $('.mostName').html(bestScoreEntry.name_user || 'No name');
          $('.mostViews').html((bestScoreEntry.score || 0).toLocaleString());
      } else {
          $('.mostName').html('No data');
          $('.mostViews').html('0');
      }
  } else {
      $('.mostName').html('No data');
      $('.mostViews').html('0');
  }
}

function getBestScore(gamers) {
  let bestScore = -Infinity;
  let bestScoreEntry = null;

  for (let name in gamers) {
      if (gamers[name]?.score !== undefined) {
          if (gamers[name].score > bestScore) {
              bestScore = gamers[name].score;
              bestScoreEntry = gamers[name];
          }
      }
  }

  return bestScoreEntry;
}


$('.awesome').click(function(){
    playSound(buttonClick)
    $('.overlay, .featured_modal').fadeOut();
    globals.paused = false;
})
function feature(penName) {
    globals.paused = true;
    $('.overlay, .featured_modal').show();

    let p =  Math.floor(Math.random() * pickers.length);

    $('.featured_modal .picker').html(pickers[p])
    $('.featured_modal .name').html(penName)
}

function gameLoop() {
    if(d == globals.gameLength) {
        globals.paused = true;
        $('.endGame, .overlay').show()
        $('.pencount').html(pens.length + ' ')

        // Fetch the best score and update the page
        fetchBestScore();

        globals.paused = true;
    }

    if(!globals.paused){
        time++;
        $('.researchButton_counter span').html($('.available').length)
        $('.pip').each(function() {

            if($(this).data('type') == 'html') {
                $(this).animate({ left: rootStatElementPosition.html, top: '140px' }, 2000, function(){
                    $(this).remove();
                });
            }

            if($(this).data('type') == 'css') {
                $(this).animate({ left: rootStatElementPosition.css, top: '140px' }, 1000, function(){
                    $(this).remove();
                });
            }

            if($(this).data('type') == 'js') {
                $(this).animate({ left: rootStatElementPosition.js, top: '140px' }, 1000, function(){
                    $(this).remove();
                });
            }

            if($(this).data('type') == 'design') {
                $(this).animate({ left: rootStatElementPosition.design, top: '140px' }, 1000, function(){
                    $(this).remove();
                });
            }

        })
        if(globals.auto && !globals.researching && !globals.paused) {
            if(time > globals.keyTick) {
                keyPress()
            }
        }
        if(time > globals.timerTick) {

            time = 0;
            d++;
            var day = new Date();
            var nextDay = new Date(day);
            nextDay.setDate(day.getDate() + d);
            let month = nextDay.getUTCMonth();
            let days = nextDay.getDate();
            let year = nextDay.getFullYear();
            $('.date span').html(`${monthNames[month]} ${days}, ${year}`) 
            $('.research_modal .item').each(function() {
                let index = $(this).find('.research_button').data('index') - 1;
                if(developer.followers > research[index].cost && research[index].researched == false) {
                    $(this).addClass('available') 
                    $(this).removeClass('unavailable')  
                    $(this).removeClass('researched')  
                }

                if(developer.followers < research[index].cost && research[index].researched == false) {
                    $(this).addClass('unavailable')   
                    $(this).removeClass('available')  
                    $(this).removeClass('researched')  
                }

                if(research[index].researched == true) {
                    $(this).addClass('researched')   
                    $(this).removeClass('available')  
                    $(this).removeClass('unavailable')  
                }
            })

            $('.released_pen').each(function() {
                let index = pens.length - $(this).index() - 1;
                let height = Math.ceil(pens[index].dailyViews / pens[index].maxViews * 100);

                if(pens[index].featured) {
                    $(this).find('.star').html('<img src="/static/game/assets/gStar.png" />')
                }
                if(height > 100) {
                    $(this).find('.released_pen__graph').append(`<div class="line" style="height:${height}%; top:${0}%"></div>`);
                } else {
                    $(this).find('.released_pen__graph').append(`<div class="line" style="height:${height}%; top:${100 - height}%"></div>`);
                }

                let el = $(this);


                if(el.find('.line').length > globals.maxBars) {
                    el.find('.line:first-child').remove();
                }

                let final = Math.ceil(pens[index].views).toLocaleString();
                $(this).find('.view_count').html(final);

                let comment = Math.ceil(pens[index].comments).toLocaleString();
                $(this).find('.comment_count').html(comment);

                let like = Math.ceil(pens[index].likes).toLocaleString();
                $(this).find('.like_count').html(like);
            });

            var dailyFollowers = 0;

            pens.forEach(function(p) {
                if(p.css + p.html + p.css + p.design > globals.featuredMinStats) {
                    let f = Math.floor(Math.random() * globals.featureChance);
                    if(f == 0 && !p.featuredCheck){

                        if(p.featuredCheckCount < 14) {
                            p.featured = true;
                        }
                    } else {
                        p.featuredCheckCount++; 
                    }

                }
                if(p.featured && !p.featuredBoosted) {
                    p.dailyViews = p.dailyViews * globals.featuredBoost;
                    p.featuredBoosted = true;
                    feature(p.name)
                    playSound(featuredModal)
                }

                p.dailyViews = (p.dailyViews / globals.viewDecay);
                p.likes += Math.floor((p.dailyViews / globals.viewDecay) / 40);
                p.comments += Math.floor((p.dailyViews / globals.viewDecay) / 2000);
                p.views += p.dailyViews;
                dailyFollowers += p.dailyViews
            });

            developer.followers += Math.floor((dailyFollowers / globals.followerFriction) / ((developer.html + developer.css +developer.js + developer.design) / 10) );

            $('.followers span').html(developer.followers.toLocaleString());
            $('.endGame h1').html(developer.followers.toLocaleString());
        }
    }
    window.requestAnimationFrame(gameLoop);
}

$('.go').click(function(){
    playSound(buttonClick)
    $('.intro_modal').fadeOut(function(){
        $('.overlay').fadeOut();
        globals.paused = false
    })
})

window.requestAnimationFrame(gameLoop);

class Grain {
    constructor (el) {
        this.patternSize = 150;
        this.patternScaleX = 1;
        this.patternScaleY = 1;
        this.patternRefreshInterval = 3; // 8
        this.patternAlpha = 12; // int between 0 and 255,
        this.canvas = el;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.scale(this.patternScaleX, this.patternScaleY);
        this.patternCanvas = document.createElement('canvas');
        this.patternCanvas.width = this.patternSize;
        this.patternCanvas.height = this.patternSize;
        this.patternCtx = this.patternCanvas.getContext('2d');
        this.patternData = this.patternCtx.createImageData(this.patternSize, this.patternSize);
        this.patternPixelDataLength = this.patternSize * this.patternSize * 4; // rgba = 4
        this.resize = this.resize.bind(this);
        this.loop = this.loop.bind(this);
        this.frame = 0;
        window.addEventListener('resize', this.resize);
        this.resize();
        window.requestAnimationFrame(this.loop);
    }

    resize () {
        this.canvas.width = window.innerWidth * devicePixelRatio;
        this.canvas.height = window.innerHeight * devicePixelRatio;
    }

    update () {
        const {patternPixelDataLength, patternData, patternAlpha, patternCtx} = this;

        // put a random shade of gray into every pixel of the pattern
        for (let i = 0; i < patternPixelDataLength; i += 4) {
            // const value = (Math.random() * 255) | 0;
            const value = Math.random() * 255;

            patternData.data[i] = value;
            patternData.data[i + 1] = value;
            patternData.data[i + 2] = value;
            patternData.data[i + 3] = patternAlpha;
        }

        patternCtx.putImageData(patternData, 0, 0);
    }

    draw () {
        const {ctx, patternCanvas, canvas, viewHeight} = this;
        const {width, height} = canvas;

        // clear canvas
        ctx.clearRect(0, 0, width, height);

        // fill the canvas using the pattern
        ctx.fillStyle = ctx.createPattern(patternCanvas, 'repeat');
        ctx.fillRect(0, 0, width, height);
    }

    loop () {
        // only update grain every n frames
        const shouldDraw = ++this.frame % this.patternRefreshInterval === 0;
        if (shouldDraw) {
            this.update();
            this.draw();
        }

        window.requestAnimationFrame(this.loop);
    }
}

const el = document.querySelector('.grain');
const grain = new Grain(el);

$('input').keydown(function(e){
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode == '13'){
        if($('input').val() != '') {
            playSound(buttonClick)
            $('.name_modal').css('left','-200%');
            $('.intro_modal').css('left','0%');
            $('.username h2').html($('input').val())
            playAudio(bg)
        } else {
            $('input').css('border-color', '#f16059')
        }
        return false;
    }
})

$('.next').click(function() {
    if($('input').val() != '') {
        playSound(buttonClick)
        $('.name_modal').css('left','-200%');
        $('.intro_modal').css('left','0%');
        $('.username h2').html($('input').val())
        playAudio(bg)
    } else {
        $('input').css('border-color', '#f16059')
    }
})

function animateValue(c, start, end, duration) {
    var range = end - start;
    var current = start;
    var increment = end > start? 1 : -1;
    var stepTime = Math.abs(Math.floor(duration / range));
    var obj = $('.' + c)
    var timer = setInterval(function() {
        current += increment;
        obj.innerHTML = current;
        if (current == end) {
            clearInterval(timer);
        }
    }, stepTime);
}

// ## Create a function to play our sounds
function playSound(sound) {
    if (globals.audio) {
        sound.play(); // Play sound
    }
}

function playAudio(sound) {
    sound.loop = true;
    sound.volume = 0.5;
    sound.play(); // Play sound
    sound.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    });
}


// STARS EFFECT
let stars = [];
let speed = 10;
const maxSpeed = 10;
const minSpeed = 0;
const speedChange = 0.2;
let isMouseDown = false;
let cockpitImage = new Image();
const actionMsg = document.getElementById('actionMsg');

function starEffect() {
    $('body').css('margin', '0');

    let canvas = $('<canvas>').attr({
        width: $(window).width(),
        height: $(window).height()
    }).css({
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -1, // Set the z-index to position it behind other elements
    });
    $('body').prepend(canvas);

    $('body').on("mousedown touchstart", onMouseDown);
    $('body').on("mouseup touchend", onMouseUp);

    for (let i = 0; i < 100; i++) {
        let loc = {
            x: Math.random() * canvas.width(),
            y: Math.random() * canvas.height()
        }
        stars.push(new Star(loc));
    }

    animateStar(canvas[0]);
}

function onMouseDown() {
    isMouseDown = true;
}

function onMouseUp() {
    isMouseDown = false;
}

function animateStar(canvas) {
    if (isMouseDown) {
        speed += speedChange;
    } else {
        speed -= speedChange;
    }
    speed = Math.max(minSpeed, Math.min(speed, maxSpeed));

    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < stars.length; i++) {
        stars[i].update();
    }
    for (let i = 0; i < stars.length; i++) {
        stars[i].draw(ctx);
    }
    if (speed == 0) {
      canvas.style.display = "none";
      setTimeout(() => {
        actionMsg.style.display = ""; // Hide the element after transition completes
      }, 10000);
    } else {
      canvas.style.display = "";
      actionMsg.style.display = "none";
    }

    ctx.drawImage(cockpitImage, 0, 0, canvas.width, canvas.height);
    window.requestAnimationFrame(() => animateStar(canvas));
}

class Star {
    constructor(location) {
        this.location = location;
        this.radius = 2 + Math.random() * 2;
    }
    update(){
      let center={
        x:$(window).width()/2,
        y:$(window).height()/2
      }
      let angle=Math.atan2(
        this.location.y-center.y,
        this.location.x-center.x
      );
      
      this.location.x+=speed*Math.cos(angle);
      this.location.y+=speed*Math.sin(angle);
      
      if(this.location.x>$(window).width() ||
         this.location.x<0 ||
         this.location.y<0 ||
         this.location.y>$(window).height()){
        this.location.x=Math.random()*
                  $(window).width();
        this.location.y=Math.random()*
                  $(window).height();
      }
      
      let distToCenter = Math.sqrt(
        Math.pow(this.location.x-center.x,2)+
        Math.pow(this.location.y-center.y,2)
      );
      this.radius = 1+3*distToCenter/$(window).width();
    }
    draw(ctx){
      ctx.beginPath();
      ctx.moveTo(this.location.x,
                 this.location.y);
             
      let center={
        x:$(window).width()/2,
        y:$(window).height()/2
      }
      let weight=80-70*(speed/maxSpeed);
      let pastLocation={
        x:(weight*this.location.x+center.x)/(weight+1),
        y:(weight*this.location.y+center.y)/(weight+1),
      }
      ctx.lineTo(pastLocation.x,
                 pastLocation.y);
      ctx.strokeStyle="white";
      ctx.lineWidth=this.radius;
      ctx.stroke();
    }
}

starEffect();
