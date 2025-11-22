/**
 * 🎯 ALERT CLASSIFICATION SYSTEM
 * Prevents dangerous alert type mismatches
 */

function classifyAlertType(alert) {
    const title = alert.title.toLowerCase();
    const content = alert.content.toLowerCase();
    const combined = `${title} ${content}`;
    
    const scores = { water: 0, storm: 0, flood: 0, drones: 0, exercises: 0, health: 0 };
    
    // 💧 WATER CONTAMINATION
    ['woda niezdatna', 'nie nadaje się do spożycia', 'nie pij', 'wodociąg'].forEach(keyword => {
        if (combined.includes(keyword)) scores.water += 3;
    });
    
    // ⛈️ STORMS  
    ['burza', 'grad', 'wiatr', 'silny wiatr', 'orkan'].forEach(keyword => {
        if (combined.includes(keyword)) scores.storm += 3;
    });
    
    // 🌊 FLOODS
    ['powódź', 'podtopienia', 'wezbranie', 'zalanie', 'rzeka'].forEach(keyword => {
        if (combined.includes(keyword)) scores.flood += 3;
    });
    
    // 🚁 DRONES
    ['dron', 'drony', 'obiekt', 'naruszyły granice', 'neutralizacja obiektów'].forEach(keyword => {
        if (combined.includes(keyword)) scores.drones += 3;
    });
    
    // 🎯 EXERCISES
    ['ćwiczenia', 'manewry', 'strzały', 'helikoptery', 'służby mundurowe'].forEach(keyword => {
        if (combined.includes(keyword)) scores.exercises += 3;
    });
    
    // 🏥 HEALTH/ANIMALS
    ['szczepionka', 'wściekliźnie', 'lisy', 'zwierzęta', 'zdrowie publiczne', 'epidemia'].forEach(keyword => {
        if (combined.includes(keyword)) scores.health += 3;
    });
    
    // Find best match (minimum 3 points)
    let maxScore = 0;
    let bestType = null;
    
    for (const [type, score] of Object.entries(scores)) {
        if (score > maxScore && score >= 3) {
            maxScore = score;
            bestType = type;
        }
    }
    
    console.log(`🔍 Alert: "${alert.title}" → ${bestType || 'UNKNOWN'} (${maxScore}pts)`);
    return bestType;
}

window.classifyAlertType = classifyAlertType;
console.log('🎯 Alert Classifier loaded');
