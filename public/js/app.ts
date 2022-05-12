(function () {
    const form = document.querySelector('form');
    const img = <HTMLImageElement>document.querySelector('img');
    const input = <HTMLInputElement>document.getElementById('avatar');
    const progress = <HTMLElement>document.querySelector('.progress');

    if (!form) {
        console.log('Danger! No form :(');
        return;
    }

    if (!img) {
        console.log('Danger! No image :(');
        return;
    }

    form.addEventListener('submit', onSubmit, false);

    function onSubmit(ev: Event) {
        ev.preventDefault();

        if (!input) {
            console.log('Danger! No input :(');
            return;
        } else if (!input.files) {
            console.log('Danger! No input files :(');
            return;
        } else if (!Uint8Array || !FileReader) {
            alert('Image upload not supported');
            return;
        }
        // else if (!FormData) {
        //     alert('Image upload not supported');
        //     return;
        // }

        const file = input.files[0];

        if (!file) {
            console.log('Danger! No file found :(');
            return;
        }

        const xhr = new XMLHttpRequest();

        if (!!progress) {
            xhr.upload.addEventListener('progress', (ev) => {
                if (!ev.lengthComputable) {
                    progress.textContent = '';
                    return;
                }

                const percent = ev.loaded / ev.total;
                progress.textContent = `${Math.round(percent * 100)}%`;
            }, false);
        }

        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                const status = xhr.status;

                if ((status >= 200 && status < 300) || status === 304) {
                    const res = JSON.parse(xhr.response);

                    if (!res) {
                        alert('No file upload response');
                        return;
                    }

                    const url = res.url;
                    img.src = url;
                    img.classList.remove('hidden');
                } else {
                    alert('File upload failed');
                }
            }
        };

        const fr = new FileReader();

        fr.onload = (ev) => {
            const fileData = <string>ev.target?.result;
            const sBoundary = `------COVALENCE${Date.now().toString(16)}TS`;
            const fileEntry = `Content-Disposition: form-data; name="avatar"; filename="${file.name}"\r\nContent-Type: ${file.type}\r\n\r\n${fileData}`;
            const payload = `--${sBoundary}\r\n${fileEntry}\r\n--${sBoundary}--\r\n`;
            const nBytes = payload.length;
            const ui8Data = new Uint8Array(nBytes);

            for (let nIdx = 0; nIdx < nBytes; ++nIdx) {
                ui8Data[nIdx] = payload.charCodeAt(nIdx) & 0xff;
            }

            xhr.open('POST', '/api/v1/users/avatar', true);
            xhr.setRequestHeader('Content-Type', `multipart/form-data; boundary=${sBoundary}`);
            xhr.send(ui8Data);
        };

        fr.onerror = () => {
            alert('File upload failed');
        };

        fr.readAsBinaryString(file);

        // const payload = new FormData();

        // payload.append('avatar', file);

        // xhr.open('POST', '/api/v1/users/avatar', true);
        // xhr.send(payload);
    }
})();