// 1. create last.fm account
// 2. connect it with spotify (check settings)
// 3. create api key (https://www.last.fm/api/account/create)

const api = 'apikey'; // replace with API Key from last.fm
const username = 'ilhamfauzan'; // last.fm username
const time = 2; // in seconds

let current;

async function update(previous, onSuccess) {
    try {
        const response = await fetch(`http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${api}&format=json&limit=2`);
        const json = await response.json();

        if (!json.recenttracks) {
            throw new Error("Error fetching lastfm api: " + json.message);
        }

        const trackSrc = json.recenttracks.track[0];

        const track = {
            title: trackSrc.name,
            artist: trackSrc.artist["#text"],
            album: trackSrc.album["#text"],
            url: trackSrc.url
        };

        // Check if there's a change in the track or status
        const isNowPlaying = trackSrc["@attr"] && trackSrc["@attr"].nowplaying === "true";
        if (!previous || previous.track.title !== track.title || previous.track.album !== track.album || previous.isNowPlaying !== isNowPlaying) {
            onSuccess({ track, isNowPlaying });
        }
    } catch (error) {
        console.error("error fetching last.fm api: ", error);
    }
}

function setNew(details) {
    if (!details) return;
    current = details;

    const status = details.isNowPlaying ? 'LISTENING TO ' : 'LAST PLAYED SONG';

    const trackLink = `<a href="${details.track.url}" style="text-decoration: none;" target="_blank">${details.track.title} - ${details.track.artist}</a>`; // create the track link

    $("#status").fadeOut(500, function () {
        $(this).text(status).fadeIn(200);
    });

    $("#track").fadeOut(500, function () {
        $(this).html(trackLink).fadeIn(200);
    });
}

async function checkAndUpdate() {
    const previous = current;
    await update(previous, setNew);
}

setInterval(checkAndUpdate, time * 2000);
