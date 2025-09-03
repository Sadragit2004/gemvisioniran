document.addEventListener("DOMContentLoaded", function () {
    const provinceSelect = document.getElementById("province");
    const citySelect = document.getElementById("city");

    if (!provinceSelect || !citySelect) {
        console.error("خطا: المان‌های ورودی استان یا شهر یافت نشدند.");
        return;
    }

    // دریافت استان‌ها از API
    fetch("https://iran-locations-api.ir/api/v1/fa/states")
        .then(response => {
            if (!response.ok) throw new Error(`خطا در دریافت استان‌ها: ${response.status}`);
            return response.json();
        })
        .then(states => {
            if (!Array.isArray(states)) throw new Error("فرمت داده‌های استان‌ها نادرست است.");
            states.forEach(state => {
                const option = document.createElement("option");
                option.value = state.id;
                option.textContent = state.name;
                provinceSelect.appendChild(option);
            });
        })
        .catch(error => console.error(error));

    // دریافت شهرها هنگام تغییر استان
    provinceSelect.addEventListener("change", function () {
        const selectedProvinceId = provinceSelect.value;
        citySelect.innerHTML = '<option value="">انتخاب شهر</option>'; // پاک کردن شهرهای قبلی

        if (!selectedProvinceId) return;

        fetch(`https://iran-locations-api.ir/api/v1/fa/cities?state_id=${selectedProvinceId}`)
            .then(response => {
                if (!response.ok) throw new Error(`خطا در دریافت شهرها: ${response.status}`);
                return response.json();
            })
            .then(cities => {
                if (!Array.isArray(cities)) throw new Error("فرمت داده‌های شهرها نادرست است.");
                cities.forEach(city => {
                    const option = document.createElement("option");
                    option.value = city.name;
                    option.textContent = city.name;
                    citySelect.appendChild(option);
                });
            })
            .catch(error => console.error(error));
    });
});
