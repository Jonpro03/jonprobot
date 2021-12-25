namespace TextExtractor.Test
{
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using System;

    [TestClass]
    public class Globalization
    {
        [TestMethod]
        public void ValidateNumberFormats()
        {
            // floating point precision tomfoolery requires approximation
            Assert.IsTrue(Program.TryParseFloat("1,234.56", out var result));
            Assert.IsTrue(Math.Abs(result - 1234.56) < 0.0001);

            Assert.IsTrue(Program.TryParseFloat("1.234,56", out result));
            Assert.IsTrue(Math.Abs(result - 1234.56) < 0.0001);

            Assert.IsTrue(Program.TryParseFloat("1 234,56", out result));
            Assert.IsTrue(Math.Abs(result - 1234.56) < 0.0001);
        }
    }
}
