$(document).ready(function() {
    var listOfElements = $('select[id^="id_features_value-"][id$="-feature"]');
    console.log(listOfElements)

    $(listOfElements).on('change', function() {

        alert('ddd');
        f_id = $(this).val();
        dd1 = $(this).attr('id');
        dd2 = dd1.replace("-feature", "-filter_value");
        $.ajax({
            type: "GET",
            url: "/ajax_admin/?feature_id=" + f_id,
            success: function(res) {
                cols = document.getElementById(dd2);
                cols.options.length = 0;
                for (var k in res) {
                    cols.options.add(new Option(k, res[k]));
                }
            }
        });
    });
});
  