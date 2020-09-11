export let gameSettings = {
    currentLevel : 1,
    totalLevels : 20,
    currentRound : 1,
    totalRounds: 6,
    score : 0,
    scoreIncrement: 20,
    scoreDecrement: 10,
    subject : '',
    success: 0,
    playSound (soundToPlay) {
        soundToPlay.play()
    },
    soundControl(checkBoxId,soundForWinning,soundForLosing){
        if (!checkBoxId){
            checkBoxId = 'music'
        }
        if (!soundForWinning){
            soundForWinning = 'winSound'
        }
        if (!soundForLosing){
            soundForLosing = 'loseSound'
        }
        const Volume = 1.0
        const winSound = document.getElementById(soundForWinning);
        const loseSound = document.getElementById(soundForLosing);
        const soundCheckBox = document.getElementById(checkBoxId);
        const SoundListener = soundCheckBox.addEventListener('change',()=>{
            if (soundCheckBox.checked) {
                winSound.volume = Volume;
                loseSound.volume = Volume;
            } else {
                winSound.volume = 0;
                loseSound.volume = 0;
            }
        });
        return SoundListener
    }
}