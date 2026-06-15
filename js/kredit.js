let kreditList = [];

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

    const card =
      document.createElement("div");

    card.innerHTML = `
      <div class="dompetCard">

        <div>
          <h4>${d.nama_kredit}</h4>
          <small>${d.catatan}</small>
        </div>

        <div class="dompetSaldo">
          <b>Rp ${Number(d.nominal_kredit).toLocaleString("id-ID")}</b>
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

  if(!nominalPinjaman || Number(nominalPinjaman) <= 0){
    showToast("Nominal tidak valid");
    return;
  }

  if(!sumberTujuan){
    showToast("Pilih dompet tujuan");
    return;
  }

  // ================= DATA =================

  const data = {

    mode: "buat_kredit",

    id_user: user.userId,

    nama_kredit: namaKredit,

    jenis_kredit: jenisKredit,

    nominal_kredit: getNumber(nominalKredit),

    nominal_pinjaman: getNumber(nominalPinjaman),

    sumber_tujuan: sumberTujuan,

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

// ================= RESET FORM =================
function resetForm(){
  document.getElementById("namaKredit").value = "";
  document.getElementById("sumberTujuan").value = "";
  document.getElementById("nominalKredit").value = "";
  document.getElementById("catatan").value = "";
  document.getElementById("nominalPinjaman").value = "";

}