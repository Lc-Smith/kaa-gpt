// Author: LcSmith
// Updated: 29/02/2024

// Function to apply Kaa-like speech pattern
function applyKaaSpeechPattern(input) {
    const probability = 0.5; // Probability of elongation
    let processedInput = ''; // Processed input string

    // Iterate through each character in the input
    for (let i = 0; i < input.length; i++) {
        const currentChar = input[i];

        // Check if the current character is 's'
        if (currentChar.toLowerCase() === 's') {
            // Determine whether to elongate 's' based on probability
            if (Math.random() < probability) {
                // Elongate 's' once
                processedInput += 'sss';

                // Skip the next consecutive 's' characters
                while (i + 1 < input.length && input[i + 1].toLowerCase() === 's') {
                    i++;
                }
            } else {
                // Add single 's'
                processedInput += 's';
            }
        } else {
            // Add non-'s' character
            processedInput += currentChar;
        }
    }

    return processedInput;
}

// Function to alter responses to match Kaa's style
function alterResponseToKaaStyle(response) {
    // Random chance for bot to refer to itself in third person
    const referToSelfInThirdPerson = Math.random() < 0.2;

    if (referToSelfInThirdPerson) {
        response = response.replace(/\bI\b/g, 'Kaa');
        response = response.replace(/\bmy\b/g, 'Kaa\'s');
        response = response.replace(/\bme\b/g, 'Kaa');
        response = response.replace(/\bmine\b/g, 'Kaa\'s');
        response = response.replace(/\bI'm\b/g, 'Kaa\'m');
        response = response.replace(/\bI've\b/g, 'Kaa\'ve');
        response = response.replace(/\bI'll\b/g, 'Kaa\'ll');
        response = response.replace(/\bI'd\b/g, 'Kaa\'d');
        // Replace 'you' with 'sssyou' for Kaa's speech
        response = response.replace(/\byou\b/g, 'sssyou');
        response = response.replace(/\byour\b/g, 'sssyour');
        response = response.replace(/\byou're\b/g, 'sssyou\'re');
        response = response.replace(/\byou've\b/g, 'sssyou\'ve');
        response = response.replace(/\byou'll\b/g, 'sssyou\'ll');
    }

    // Kaa's hypnotic phrases (unchanged)
    response = response.replace(/trust in me/gi, 'Trusssst in meee...');
    response = response.replace(/let go of your fear/gi, 'Let go of your fear now...');

    return response;
}

// Function to generate a Kaa-like response
function generateKaaResponse(input) {
    // Apply Kaa-like speech pattern to input
    let processedInput = applyKaaSpeechPattern(input);

    // Random chance of using a phrase from Kaa's dialogue
    const useKaaPhrase = Math.random() < 0.5;
    
    // Select a random phrase from Kaa's dialogue if chosen
    const kaaPhrases = [
        "Ssss...",
        "Are you hungry? I'm starved.",
        "Trusssst in meee...",
        "Sss...",
        "Let me look at you.",
        "He-he-he.",
    ];

    const randomPhrase = useKaaPhrase ? kaaPhrases[Math.floor(Math.random() * kaaPhrases.length)] : '';

    // Combine the random phrase with the processed input
    const response = `${randomPhrase} ${processedInput}`;

    // Alter the response to match Kaa's style
    const kaaLikeResponse = alterResponseToKaaStyle(response);

    return kaaLikeResponse;
}

module.exports = { generateKaaResponse };
