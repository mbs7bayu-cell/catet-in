let kreditList = [];
let daftarDompet = [];

async function loadData() {

  const user = JSON.parse(
    sessionStorage.getItem("user") ||
    localStorage.getItem("user") ||
    localStorage.getItem("activeUser")
  );

  if(!user){

    location.href = "login.html";
  }

  const res = await fetch(`${API}?mode=kredit&userId=${user.userId}`);

  kreditList = await res.json();

  console.log(kreditList);

  render();
}

function render() {

  const kreditListEl =
    document.getElementById("kreditList");
  
  kreditListEl.classList.add("skeleton-card");

  const user = JSON.parse(
    sessionStorage.getItem("user") ||
    localStorage.getItem("user") ||
    localStorage.getItem("activeUser")
  );

  if(!user){

    location.href = "login.html";
  }

  kreditListEl.innerHTML = "";

  const filtered =
    kreditList.filter(d =>
      d.id_user === user.userId
    );

  if(filtered.length === 0){

    kreditListEl.innerHTML =
      "<p class='kosong'>Tidak ada kredit.</p>";

    kreditListEl.classList.remove("skeleton-card");


    return;
  }

  filtered.forEach(d => {

    const total = Number(d.nominal_kredit);
    const sisa = Number(d.sisa_kredit);

    let tombol = "";

    // belum pernah dibayar
    if(sisa === total){

      tombol = `
        <button
          onclick="openBayarKredit('${d.id_kredit}')"
          class="btnBayarKredit"
        >
          Bayar
        </button>

        <button
          onclick="hapusKredit('${d.id_kredit}')"
          class="btnHapusKredit"
        >
          Hapus
        </button>
      `;

    }
    // sudah dibayar sebagian
    else if(sisa > 0){

      tombol = `
        <button
          onclick="openBayarKredit('${d.id_kredit}')"
          class="btnBayarKredit"
        >
          Bayar
        </button>
      `;

    }
    // lunas
    else{

      tombol = `
        <button
          onclick="hapusKredit('${d.id_kredit}')"
          class="btnHapusKredit"
        >
          Hapus
        </button>
      `;

    }

    const card =
      document.createElement("div");

    card.innerHTML = `
      <div class="kreditCard">

        <div class="kreditInfo">
          <h4>${d.nama_kredit}</h4>
          <small>${d.catatan}</small>
        </div>

        <div class="kreditNominal">
          <div>
            <span>Total</span>
            <b>
              Rp ${Number(d.nominal_kredit)
                .toLocaleString("id-ID")}
            </b>
          </div>
        </div>

        <div class="kreditNominal">
          <div>
            <span>Sisa</span>
            <b class="sisaKredit">
              Rp ${Number(d.sisa_kredit)
                .toLocaleString("id-ID")}
            </b>
          </div>
        </div>

        <div class="kreditNominal">
            <div>
            <span>Status</span>
            <b>
              ${d.status}
            </b>
          </div>
        </div>

        <div class="kreditAction">
            ${tombol}
        </div>

      </div>
    `;

    kreditListEl.classList.remove("skeleton-card");


    kreditListEl.appendChild(card);

  });
}

document.addEventListener("DOMContentLoaded", () => {

  loadTheme();

  loadDompet();

  formatInputRupiah("nominalKredit");
  formatInputRupiah("nominalPinjaman");
  formatInputRupiah("nominalBayar");

  const btnKredit =
    document.getElementById("btnKredit");

  btnKredit.addEventListener("click", () => {

        document.getElementById("modalKredit")
            .style.display = "flex";
        }

  );

  loadData();
});


// ================ tambah kredit ==================

function closeModal(){

  document.getElementById("modalKredit")
    .style.display = "none";
}

// ================ pilihan jenis barang ====================

document
.getElementById("jenisKredit")
.addEventListener("change", function(){

  if(this.value === "Barang"){

    document.getElementById(
      "nominalPinjaman"
    ).value = "";

    document.getElementById(
      "sumberTujuan"
    ).value = "";

  }

});

async function simpanKredit(){

  const btn = document.getElementById("btnSimpanKredit");

  const user =
  JSON.parse(
    sessionStorage.getItem("user") ||
    localStorage.getItem("user") ||
    localStorage.getItem("activeUser")
  );

  const namaKredit =
    document.getElementById("namaKredit").value.trim();

  const jenisKredit =
    document.getElementById("jenisKredit").value.trim();

  const nominalKredit =
    document.getElementById("nominalKredit").value;

  const nominalPinjaman =
    document.getElementById("nominalPinjaman").value;

  const sumberTujuan =
    document.getElementById("sumberTujuan").value;

  const catatan =
    document.getElementById("catatan").value.trim();

  const status = document.getElementById("status");

  // ================= VALIDASI =================

  if(!namaKredit){
    showToast("Nama Kredit harus diisi");
    return;
  }

  if(!jenisKredit){
    showToast("jenis kredit wajib diisi");
    return;
  }

  if(!nominalKredit || Number(nominalKredit) <= 0){
    showToast("Nominal tidak valid");
    return;
  }

  // ================ validasi pinjaman =================
  if(jenisKredit === "Pinjaman"){

    if(!nominalPinjaman ||
      Number(nominalPinjaman) <= 0){
      showToast("Nominal pinjaman tidak valid");
      return;
    }

    if(!sumberTujuan){
      showToast("Pilih dompet tujuan");
      return;
    }
  }

  // ================= DATA =================

  const data = {

    mode: "buat_kredit",

    id_user: user.userId,

    nama_kredit: namaKredit,

    jenis_kredit: jenisKredit,

    nominal_kredit: getNumber(nominalKredit),

    nominal_pinjaman:
      jenisKredit === "Pinjaman"
        ? getNumber(nominalPinjaman)
        : 0,

    sumber_tujuan:
      jenisKredit === "Pinjaman"
        ? sumberTujuan
        : "",

    catatan: catatan

  };

  // ================= LOADING =================

  btn.disabled = true;
  btn.innerText = "Menyimpan...";

  try{

    const res = await fetch(API, {

      method: "POST",

      body: JSON.stringify(data)

    });

    const hasil = await res.json();

    if(hasil.ok){

      btn.innerText = "Berhasil ✔";

      showToast("Simpan kredit berhasil");

      status.innerHTML = "✅ Kredit berhasil disimpan.";


      setTimeout(() => {

        resetForm();
        btn.innerText = "Simpan";
        btn.disabled = false;

        window.location.href = "kredit.html";

      }, 800);

    }else{

      showToast(hasil.msg || "Gagal");

      btn.disabled = false;
      btn.innerText = "Simpan";
    }

  }catch(err){

    console.error(err);

    showToast("Error server");

    btn.disabled = false;
    btn.innerText = "Simpan";
  }
}

// ============================= hidden nominal pinjaman ===================
const jenisKredit =
document.getElementById("jenisKredit");

const pinjamanGroup =
document.getElementById("pinjamanGroup");

function cekJenisKredit(){

  if(jenisKredit.value === "Pinjaman"){
    pinjamanGroup.classList.remove("hidden");
  }else{
    pinjamanGroup.classList.add("hidden");
  }

}

jenisKredit.addEventListener(
  "change",
  cekJenisKredit
);

// jalankan saat halaman dibuka
cekJenisKredit();

// ========================= load dompet =========================

async function loadDompet(){

  const user = JSON.parse(
    sessionStorage.getItem("user") ||
    localStorage.getItem("user") ||
    localStorage.getItem("activeUser")
  );

  if(!user){

    location.href = "login.html";
  }

  try{

    const res = await fetch(API);

    const data = await res.json();

    const tujuan =
      document.getElementById("sumberTujuan");

    tujuan.innerHTML =
      `
      <option value="">
        -- pilih dompet --
      </option>
      `;

    const milikUser =
      data.filter(d => d.id_user === user.userId);

    daftarDompet = milikUser;


    milikUser.forEach(d => {

      const text =
        `${d.nama} - Rp ${Number(d.saldo).toLocaleString("id-ID")}`;

      const opt2 = document.createElement("option");

      opt2.value = d.id_sumber;
      opt2.textContent = text;

      tujuan.appendChild(opt2);

    });

  }catch(err){

    console.error(err);
    showToast("Gagal load dompet");
  }
}

// ================= FORMAT RUPIAH =================

function formatInputRupiah(id){

  const input = document.getElementById(id);

  input.addEventListener("input", function(){

    let angka =
      this.value.replace(/\D/g,"");

    if(!angka){
      this.value = "";
      return;
    }

    this.value =
      "Rp " +
      new Intl.NumberFormat("id-ID")
      .format(angka);

  });
}

// =================== hapus kredit =====================
async function hapusKredit(idKredit){

const user = JSON.parse(
    sessionStorage.getItem("user") ||
    localStorage.getItem("user") ||
    localStorage.getItem("activeUser")
  );

if(!user){
    location.href = "login.html";
}

if(!confirm("Yakin ingin menghapus kredit ini?")){
return;
}

try{

const res = await fetch(API, {
  method: "POST",
  body: JSON.stringify({
    mode: "hapusKredit",
    id_kredit: idKredit,
    userId: user.userId
  })
});

const hasil = await res.json();

if(hasil.ok){

  showToast("Kredit berhasil dihapus");

  loadData();

}else{

  showToast(
    hasil.msg || "Gagal menghapus kredit"
  );

}


}catch(err){

console.error(err);

showToast("Error server");


}

}

// ======================= bayar kredit =======================
async function bayarKredit(idKredit, idDompet, nominal) {

  const user = JSON.parse(
    sessionStorage.getItem("user") ||
    localStorage.getItem("user") ||
    localStorage.getItem("activeUser")
  );

  const btn = document.getElementById("bayarKredit");

  btn.disabled = true;
  btn.innerText = "Menyimpan...";

  const res = await fetch(API, {
    method: "POST",
    body: JSON.stringify({
      mode: "bayarKredit",
      id_kredit: idKredit,
      id_dompet: idDompet,
      userId: user.userId,
      nominal: nominal
    })
  });

  const hasil = await res.json();

  if (hasil.ok) {
    showToast("Pembayaran berhasil");
    closeBayarKredit();
    loadData();
    btn.innerText = "Berhasil ✔";

    setTimeout(() => {

        resetForm();
        btn.innerText = "Simpan";
        btn.disabled = false;

        window.location.href = "kredit.html";

      }, 800);
  } else {
    showToast(hasil.msg || "Gagal bayar");
    btn.disabled = false;
    btn.innerText = "Simpan";
  }
      
}

// ========================= modal bayar kredit ===================
let selectedKreditId = null;

function openBayarKredit(idKredit) {

  selectedKreditId = idKredit;

  const select =
  document.getElementById("dompetBayar");

  select.innerHTML = "";

  daftarDompet.forEach(dompet => {

    select.innerHTML += `
      <option value="${dompet.id_sumber}">
        ${dompet.nama} - Rp ${Number(dompet.saldo).toLocaleString("id-ID")}
      </option>
    `;

  });

  document
    .getElementById("modalBayar")
    .classList.remove("hidden");

}

function closeBayarKredit() {
  document.getElementById("modalBayar").classList.add("hidden");
  document.getElementById("nominalBayar").value = "";
  selectedKreditId = null;
}

//============================= submit bayar kredit ==================
async function submitBayarKredit() {

  const nominal =
    getNumber(document.getElementById("nominalBayar").value)
  ;

  const idDompet =
    document.getElementById("dompetBayar").value;

  if (!nominal || nominal <= 0) {
    showToast("Nominal tidak valid");
    return;
  }

  await bayarKredit(
    selectedKreditId,
    idDompet,
    nominal
  );

}


// ================= RESET FORM =================
function resetForm(){
  document.getElementById("namaKredit").value = "";
  document.getElementById("sumberTujuan").value = "";
  document.getElementById("nominalKredit").value = "";
  document.getElementById("catatan").value = "";
  document.getElementById("nominalPinjaman").value = "";

}

