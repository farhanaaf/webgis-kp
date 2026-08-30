const map = L.map('map', {
      zoomControl:false,
      center:[-6.20,106.83],
      zoom:10,
      attributionControl:true
    });

    const baseMaps = {
      "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        maxZoom:19, attribution:'© OpenStreetMap contributors'
      }),
      "Light": L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{
        maxZoom:20, attribution:'© OpenStreetMap © CARTO'
      }),
      "Esri Street": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',{
        maxZoom:19, attribution:'Tiles © Esri'
      }),
      "Esri Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{
        maxZoom:19, attribution:'Tiles © Esri'
      }),
      "Dark": L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{
        maxZoom:20, attribution:'© OpenStreetMap © CARTO'
      })
    };
    baseMaps["OpenStreetMap"].addTo(map);

    const baseThumbs = {
      "OpenStreetMap":"https://tile.openstreetmap.org/8/204/128.png",
      "Light":"https://basemaps.cartocdn.com/light_all/8/204/128.png",
      "Esri Street":"https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/8/128/204",
      "Esri Satellite":"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/8/128/204",
      "Dark":"https://basemaps.cartocdn.com/dark_all/8/204/128.png"
    };

    const basemapPanel = document.getElementById('basemapPanel');
    Object.keys(baseMaps).forEach((name,i)=>{
      const row=document.createElement('div');
      row.className='base-item'+(i===0?' active':'');
      row.innerHTML=`
        <img class="base-thumb" src="${baseThumbs[name]}" alt="">
        <span class="base-name">${name}</span>
        <span class="base-radio"></span>`;
      row.onclick=()=>{
        Object.values(baseMaps).forEach(layer=>map.removeLayer(layer));
        baseMaps[name].addTo(map);
        document.querySelectorAll('.base-item').forEach(x=>x.classList.remove('active'));
        row.classList.add('active');
      };
      basemapPanel.appendChild(row);
    });

    const churchIcon = L.divIcon({
      className:'church-marker',
      html:'<div style="width:17px;height:17px;border-radius:50%;background:#f51b78;border:3px solid #fff;box-shadow:0 0 0 1.5px #f51b78,0 3px 7px rgba(0,0,0,.18)"></div>',
      iconSize:[20,20],iconAnchor:[10,10],popupAnchor:[0,-10]
    });

    let geoData=null;
    let allFeatures=[];
    let visibleLayer=L.layerGroup().addTo(map);

    const esc = value => String(value ?? '-')
      .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
      .replaceAll('"','&quot;').replaceAll("'","&#039;");

    function prop(p,...keys){
      for(const k of keys) if(p && p[k]!==undefined && p[k]!==null && String(p[k]).trim()!=='') return p[k];
      return '';
    }

    function coordsOf(f){
      const p=f.properties||{};
      let lat=parseFloat(prop(p,'Y','LAT','Latitude','latitude'));
      let lng=parseFloat(prop(p,'X','LON','LNG','Longitude','longitude'));
      if(Number.isFinite(lat)&&Number.isFinite(lng)) return [lat,lng];
      if(f.geometry && f.geometry.type==='Point' && Array.isArray(f.geometry.coordinates))
        return [f.geometry.coordinates[1],f.geometry.coordinates[0]];
      return null;
    }

    function churchName(p){ return prop(p,'NAMA_JEMAA','NAMA_JEMAAT','NAMA_JEMA','NAMA') || 'Gereja'; }
    function address(p){ return prop(p,'ALAMAT_GER','ALAMAT_GEREJA','ALAMAT') || '-'; }
    function pastor(p){ return prop(p,'NAMA_GEMBA','NAMA_GEMBALA','GEMBALA') || '-'; }
    function phone(p){ return prop(p,'NO_HP_WA_G','NO_HP_WA','NO_HP','TELEPON') || '-'; }
    function mawil(p){ return prop(p,'MAWIL','Mawil','MAWIL_') || '-'; }

    function googleMapsUrl(lat,lng){
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lat+','+lng)}`;
    }

    function openDetails(feature){
      const p=feature.properties||{}, c=coordsOf(feature);
      const lat=c ? c[0] : '', lng=c ? c[1] : '';
      document.getElementById('modalTitle').textContent=churchName(p);

      const photoName = prop(p,'FOTO','FOTO_GEREJA','foto');
      const photoBox=document.getElementById('photoBox');
      if(photoName){
        const src='FotoGereja/'+String(photoName).replace(/^.*[\\\\/]/,'');
        photoBox.innerHTML=`<img src="${esc(src)}" alt="Foto ${esc(churchName(p))}" onerror="this.parentElement.textContent='Foto gereja belum tersedia'">`;
      }else photoBox.textContent='Foto gereja belum tersedia';

      const rows=[
        ['📍 Alamat',address(p)],
        ['👤 Gembala',pastor(p)],
        ['☎ No. HP/WA',phone(p)],
        ['🕘 Jam Operasional',prop(p,'Jam_Operas','JAM_OPERASIONAL') || '-'],
        ['🧭 Mawil',mawil(p)],
        ['📌 Koordinat',c ? `${lat}, ${lng}` : '-']
      ];
      document.getElementById('modalDetails').innerHTML=rows.map(r=>
        `<div class="detail-row"><b>${r[0]}</b><span>${esc(r[1])}</span></div>`).join('');

      const link=document.getElementById('mapsLink');
      link.href=c?googleMapsUrl(lat,lng):'#';
      link.style.pointerEvents=c?'auto':'none';
      link.style.opacity=c?'1':'.5';
      document.getElementById('modalBackdrop').classList.add('show');
    }

    function popupHTML(feature){
      const p=feature.properties||{}, c=coordsOf(feature);
      return `<div class="popup">
        <h3>${esc(churchName(p))}</h3>
        <p><b>Alamat:</b> ${esc(address(p))}</p>
        <p><b>Gembala:</b> ${esc(pastor(p))}</p>
        <p><b>Mawil:</b> ${esc(mawil(p))}</p>
        <button class="detail-btn" onclick="openDetails(window.__churchFeatures[${allFeatures.indexOf(feature)}])">Lihat Selengkapnya</button>
      </div>`;
    }

    window.__churchFeatures=[];

    function render(features){
      visibleLayer.clearLayers();
      window.__churchFeatures=features;
      const markers=[];
      features.forEach(f=>{
        const c=coordsOf(f); if(!c) return;
        const m=L.marker(c,{icon:churchIcon});
        m.bindPopup(popupHTML(f));
        m.addTo(visibleLayer);
        markers.push(m);
      });
      document.getElementById('filterStat').textContent=features.length;
      if(features.length && !map._userMoved) map.fitBounds(L.featureGroup(markers).getBounds().pad(.12));
    }

    function updateStats(){
      document.getElementById('totalStat').textContent=allFeatures.length;
      document.getElementById('filterStat').textContent=allFeatures.length;
      const regions=new Set(allFeatures.map(f=>mawil(f.properties||{})).filter(x=>x&&x!=='-'));
      document.getElementById('wilayahStat').textContent=regions.size;
      const sel=document.getElementById('wilayahSelect');
      [...regions].sort((a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true}))
        .forEach(x=>{const o=document.createElement('option');o.value=x;o.textContent='Mawil '+x;sel.appendChild(o)});
    }

    function applyFilter(){
      const q=document.getElementById('searchInput').value.trim().toLowerCase();
      const w=document.getElementById('wilayahSelect').value;
      const filtered=allFeatures.filter(f=>{
        const p=f.properties||{};
        const hay=[churchName(p),address(p),pastor(p),phone(p),mawil(p)].join(' ').toLowerCase();
        return (!q || hay.includes(q)) && (!w || String(mawil(p))===w);
      });
      map._userMoved=false;
      render(filtered);
    }

    fetch('gereja.geojson')
      .then(r=>{if(!r.ok) throw new Error('File gereja.geojson tidak ditemukan'); return r.json()})
      .then(data=>{
        geoData=data;
        allFeatures=Array.isArray(data.features)?data.features:[];
        updateStats();
        render(allFeatures);
      })
      .catch(err=>{
        console.error(err);
        alert('Gagal membaca gereja.geojson. Pastikan index.html dan gereja.geojson berada dalam folder yang sama dan WebGIS dibuka melalui Live Server.');
      });

    /* UI EVENTS */
    document.getElementById('zoomIn').onclick=()=>map.zoomIn();
    document.getElementById('zoomOut').onclick=()=>map.zoomOut();
    document.getElementById('layerBtn').onclick=()=>basemapPanel.classList.toggle('open');

    document.getElementById('menuBtn').onclick=()=>document.getElementById('drawer').classList.add('open');
    document.getElementById('drawerClose').onclick=()=>document.getElementById('drawer').classList.remove('open');

    document.getElementById('rightToggle').onclick=()=>{
      const side=document.getElementById('sidePanel');
      side.classList.toggle('collapsed');
      document.getElementById('rightToggle').textContent=side.classList.contains('collapsed')?'«':'»';
    };

    document.getElementById('menuSearch').onclick=()=>{
      document.getElementById('searchPanel').classList.add('open');
      document.getElementById('drawer').classList.remove('open');
    };
    document.getElementById('menuFilter').onclick=()=>{
      document.getElementById('searchPanel').classList.add('open');
      document.getElementById('wilayahSelect').focus();
      document.getElementById('drawer').classList.remove('open');
    };
    document.getElementById('menuAll').onclick=()=>{
      document.getElementById('searchInput').value='';
      document.getElementById('wilayahSelect').value='';
      render(allFeatures);
      document.getElementById('drawer').classList.remove('open');
    };
    document.getElementById('menuZoom').onclick=()=>{
      if(allFeatures.length){
        const pts=allFeatures.map(coordsOf).filter(Boolean);
        if(pts.length) map.fitBounds(L.latLngBounds(pts).pad(.1));
      }
      document.getElementById('drawer').classList.remove('open');
    };

    document.getElementById('searchInput').addEventListener('input',applyFilter);
    document.getElementById('wilayahSelect').addEventListener('change',applyFilter);
    document.getElementById('showAll').onclick=()=>{
      document.getElementById('searchInput').value='';
      document.getElementById('wilayahSelect').value='';
      render(allFeatures);
    };
    document.getElementById('zoomAll').onclick=()=>{
      const pts=window.__churchFeatures.map(coordsOf).filter(Boolean);
      if(pts.length) map.fitBounds(L.latLngBounds(pts).pad(.1));
    };

    document.getElementById('modalClose').onclick=()=>document.getElementById('modalBackdrop').classList.remove('show');
    document.getElementById('modalBackdrop').addEventListener('click',e=>{
      if(e.target.id==='modalBackdrop') e.currentTarget.classList.remove('show');
    });

    map.on('movestart',()=>map._userMoved=true);
    L.control.scale({imperial:true,metric:true,position:'bottomleft'}).addTo(map);
