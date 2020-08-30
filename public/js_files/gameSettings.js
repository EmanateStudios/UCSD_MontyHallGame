export let gameSettings = {
    level : 0,
    round : 0,
    score : 0,
    subject : '',
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