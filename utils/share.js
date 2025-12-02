import { State } from '../state.js';
import { DOM } from '../dom.js';
import { UIManager } from '../managers/ui.js';

export const ShareManager = {
    async generateImage() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const width = 1080; 
        const height = 1350;
        canvas.width = width;
        canvas.height = height;

        // 1. Background Gradient
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#6366f1'); 
        grad.addColorStop(1, '#a855f7'); 
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // 2. Card Container
        const margin = 60;
        const cardY = 150;
        const cardH = height - 280; 
        ctx.fillStyle = '#ffffff';
        if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(margin, cardY, width - (margin * 2), cardH, 40);
            ctx.fill();
        } else {
            ctx.fillRect(margin, cardY, width - (margin * 2), cardH);
        }

        // 3. Text
        const name = State.data.username || "Player";
        ctx.fillStyle = '#1f2937'; 
        ctx.font = 'bold 60px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${name.toUpperCase()}'S STATS`, width / 2, cardY + 100);

        ctx.fillStyle = '#6b7280'; 
        ctx.font = '30px Inter, sans-serif';
        ctx.fillText("GOOD WORD / BAD WORD", width / 2, cardY + 150);

        // 4. Stats Grid
        const stats = [
            { label: 'Day Streak', val: State.data.daily.streak, icon: '🔥', color: '#fff7ed', text: '#ea580c' },
            { label: 'Total Votes', val: State.data.voteCount.toLocaleString(), icon: '🗳️', color: '#eff6ff', text: '#2563eb' },
            { label: 'Words Added', val: State.data.contributorCount.toLocaleString(), icon: '✍️', color: '#f0fdf4', text: '#16a34a' },
            { label: 'Themes', val: DOM.profile.themes.textContent, icon: '🎨', color: '#faf5ff', text: '#9333ea' }
        ];

        let gridY = cardY + 220;
        const boxW = 400;
        const boxH = 180;
        const gap = 40;
        const startX = (width - (boxW * 2 + gap)) / 2;

        stats.forEach((stat, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const x = startX + (col * (boxW + gap));
            const y = gridY + (row * (boxH + gap));

            ctx.fillStyle = stat.color;
            ctx.fillRect(x, y, boxW, boxH);
            ctx.strokeStyle = stat.text + '40'; 
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, boxW, boxH);

            ctx.font = '60px serif';
            ctx.textAlign = 'center';
            ctx.fillText(stat.icon, x + boxW / 2, y + 70);

            ctx.fillStyle = stat.text;
            ctx.font = 'bold 50px Inter, sans-serif';
            ctx.fillText(stat.val, x + boxW / 2, y + 130);

            ctx.fillStyle = '#6b7280';
            ctx.font = 'bold 20px Inter, sans-serif';
            ctx.fillText(stat.label.toUpperCase(), x + boxW / 2, y + 160);
        });

        // 5. Badges
        const badgeY = gridY + (2 * (boxH + gap)) + 60;
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 30px Inter, sans-serif';
        ctx.fillText("BADGES UNLOCKED", width / 2, badgeY);

        const allBadges = [
            { k: 'cake', i: '🎂' }, { k: 'llama', i: '🦙' }, { k: 'potato', i: '🥔' },
            { k: 'squirrel', i: '🐿️' }, { k: 'spider', i: '🕷️' }, { k: 'germ', i: '🦠' },
            { k: 'bone', i: '🦴' }, { k: 'poop', i: '💩' }, { k: 'penguin', i: '🐧' },
            { k: 'scorpion', i: '🦂' }, { k: 'mushroom', i: '🍄' }, { k: 'needle', i: '💉' },
            { k: 'diamond', i: '💎' }, { k: 'rock', i: '🤘' }
        ];

        let bx = (width - (7 * 80)) / 2 + 40; 
        let by = badgeY + 80;

        allBadges.forEach((b, i) => {
            const unlocked = State.data.badges[b.k];
            ctx.font = '60px serif';
            ctx.textAlign = 'center';
            
            if (unlocked) {
                ctx.globalAlpha = 1.0;
                ctx.filter = 'none';
            } else {
                ctx.globalAlpha = 0.2;
                ctx.filter = 'grayscale(100%)';
            }
            
            if (i === 7) { bx = (width - (7 * 80)) / 2 + 40; by += 100; }
            
            ctx.fillText(b.i, bx, by);
            bx += 80;
        });

        ctx.globalAlpha = 1.0;
        ctx.filter = 'none';

        // 6. Footer
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 50px Inter, sans-serif'; 
        ctx.fillText("GBword.com", width / 2, height - 90);
        
        ctx.font = '30px Inter, sans-serif';
        ctx.fillText("Play Daily & Create Words", width / 2, height - 40);

        return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    },

    async share() {
        UIManager.showPostVoteMessage("Generating image...");
        try {
            const blob = await this.generateImage();
            const file = new File([blob], 'my-gbword-stats.png', { type: 'image/png' });
            
            const shareData = {
                title: 'My Stats',
                text: 'Check out my Good Word / Bad Word stats! 🗳️',
                url: window.location.href,
                files: [file]
            };

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share(shareData);
            } else {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'gbword-stats.png';
                a.click();
                UIManager.showPostVoteMessage("Image downloaded!");
            }
        } catch (e) {
            console.error(e);
            UIManager.showPostVoteMessage("Could not share image.");
        }
    }
};