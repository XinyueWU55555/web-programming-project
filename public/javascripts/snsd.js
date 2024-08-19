am5.ready(function () {

    var root = am5.Root.new("chartdiv_snsd");
    var chart = root.container.children.push(
        am5percent.SlicedChart.new(root, {})
    );

    var series = chart.series.push(
        am5percent.PictorialStackedSeries.new(root, {
            svgPath: snsdPath,
            categoryField: "name",
            valueField: "value",
            orientation: "horizontal"
        })
    );

    series.slices.template.setAll({
        tooltipText: "{name} Entertainment: {value} billions KRW."
    });

    series.get("colors").set("colors", [
        am5.color(0xff4980),
        am5.color(0xe9cdc2),
        am5.color(0x773d31),
    ]);

    series.data.setAll([{
        name: "SM",
        value: 365387
    }, {
        name: "JYP",
        value: 102242
    },{
        name: "YG",
        value: 349861
    } ]);

    series.labels.template.set("rotation", 0);
    series.ticks.template.set("location", 0.95);
    series.slices.template.set("tooltipY", 75);
});