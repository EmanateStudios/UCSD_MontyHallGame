export let gameAttributes = {
    level = 0,
    round = 0,
    score = 0,
    subject = '',
    playSound (soundToPlay) {
        soundToPlay.play()
    },
    soundControl(checkBoxId){
        const soundCheckBox = document.getElementById('music');
        const SoundListener = soundCheckBox.addEventListener('change',()=>{
            if (soundCheckBox.checked) {
                winSound.volume = Volume;
                loseSound.volume = Volume;
            } else {
                winSound.volume = 0;
                loseSound.volume = 0;
            }
        }
        
    }
}